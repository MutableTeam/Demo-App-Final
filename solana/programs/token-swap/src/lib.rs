use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
use spl_token::{
    instruction as token_instruction,
    state::{Account as TokenAccount, Mint},
};

// Define the program ID
solana_program::declare_id!("TokenSwapProgramIDPlaceholder11111111111111");

// Program state stored in the PDA
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct SwapPool {
    pub is_initialized: bool,
    pub authority_bump: u8,
    pub mutb_mint: Pubkey,
    pub mutb_vault: Pubkey,
    pub mutb_per_sol: u64, // Exchange rate: MUTB per SOL (fixed point with 9 decimals)
}

// Instruction types
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum SwapInstruction {
    // Initialize a new swap pool
    Initialize {
        // Bump seed for the pool authority
        authority_bump: u8,
        // Exchange rate: MUTB per SOL (fixed point with 9 decimals)
        mutb_per_sol: u64,
    },
    // Swap SOL for MUTB
    SwapSolForMutb {
        // Amount of SOL to swap (in lamports)
        amount_in: u64,
        // Minimum amount of MUTB to receive (in smallest units)
        minimum_amount_out: u64,
    },
    // Swap MUTB for SOL
    SwapMutbForSol {
        // Amount of MUTB to swap (in smallest units)
        amount_in: u64,
        // Minimum amount of SOL to receive (in lamports)
        minimum_amount_out: u64,
    },
    // Update the exchange rate
    UpdateExchangeRate {
        // New exchange rate: MUTB per SOL (fixed point with 9 decimals)
        mutb_per_sol: u64,
    },
}

// Program entrypoint
entrypoint!(process_instruction);

// Program logic
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = SwapInstruction::try_from_slice(instruction_data)?;

    match instruction {
        SwapInstruction::Initialize {
            authority_bump,
            mutb_per_sol,
        } => {
            process_initialize(program_id, accounts, authority_bump, mutb_per_sol)
        }
        SwapInstruction::SwapSolForMutb {
            amount_in,
            minimum_amount_out,
        } => {
            process_swap_sol_for_mutb(program_id, accounts, amount_in, minimum_amount_out)
        }
        SwapInstruction::SwapMutbForSol {
            amount_in,
            minimum_amount_out,
        } => {
            process_swap_mutb_for_sol(program_id, accounts, amount_in, minimum_amount_out)
        }
        SwapInstruction::UpdateExchangeRate { mutb_per_sol } => {
            process_update_exchange_rate(program_id, accounts, mutb_per_sol)
        }
    }
}

// Initialize a new swap pool
fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    authority_bump: u8,
    mutb_per_sol: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get accounts
    let initializer = next_account_info(account_info_iter)?;
    let pool_account = next_account_info(account_info_iter)?;
    let pool_authority = next_account_info(account_info_iter)?;
    let mutb_mint = next_account_info(account_info_iter)?;
    let mutb_vault = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let rent_sysvar = next_account_info(account_info_iter)?;
    
    // Verify the initializer is the signer
    if !initializer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Create the pool account
    let rent = Rent::from_account_info(rent_sysvar)?;
    let space = SwapPool::default().try_to_vec()?.len();
    let lamports = rent.minimum_balance(space);
    
    invoke(
        &system_instruction::create_account(
            initializer.key,
            pool_account.key,
            lamports,
            space as u64,
            program_id,
        ),
        &[initializer.clone(), pool_account.clone()],
    )?;
    
    // Initialize the pool state
    let pool_state = SwapPool {
        is_initialized: true,
        authority_bump,
        mutb_mint: *mutb_mint.key,
        mutb_vault: *mutb_vault.key,
        mutb_per_sol,
    };
    
    pool_state.serialize(&mut *pool_account.data.borrow_mut())?;
    
    msg!("Swap pool initialized");
    Ok(())
}

// Swap SOL for MUTB
fn process_swap_sol_for_mutb(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount_in: u64,
    minimum_amount_out: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get accounts
    let user = next_account_info(account_info_iter)?;
    let user_mutb_account = next_account_info(account_info_iter)?;
    let pool_account = next_account_info(account_info_iter)?;
    let pool_authority = next_account_info(account_info_iter)?;
    let mutb_mint = next_account_info(account_info_iter)?;
    let mutb_vault = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    
    // Verify the user is the signer
    if !user.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load the pool state
    let pool_state = SwapPool::try_from_slice(&pool_account.data.borrow())?;
    
    // Verify the accounts
    if !pool_state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    if pool_state.mutb_mint != *mutb_mint.key {
        return Err(ProgramError::InvalidAccountData);
    }
    if pool_state.mutb_vault != *mutb_vault.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Calculate the amount of MUTB to mint
    let mutb_amount = (amount_in as u128)
        .checked_mul(pool_state.mutb_per_sol as u128)
        .ok_or(ProgramError::ArithmeticOverflow)?
        .checked_div(1_000_000_000)
        .ok_or(ProgramError::ArithmeticOverflow)? as u64;
    
    // Check slippage
    if mutb_amount < minimum_amount_out {
        return Err(ProgramError::InvalidInstructionData);
    }
    
    // Transfer SOL from user to the program
    invoke(
        &system_instruction::transfer(user.key, pool_authority.key, amount_in),
        &[user.clone(), pool_authority.clone(), system_program.clone()],
    )?;
    
    // Derive the authority PDA
    let seeds = &[b"authority", &[pool_state.authority_bump]];
    let signer_seeds = &[&seeds[..]];
    
    // Mint MUTB to the user
    invoke_signed(
        &token_instruction::mint_to(
            token_program.key,
            mutb_mint.key,
            user_mutb_account.key,
            pool_authority.key,
            &[],
            mutb_amount,
        )?,
        &[
            mutb_mint.clone(),
            user_mutb_account.clone(),
            pool_authority.clone(),
            token_program.clone(),
        ],
        signer_seeds,
    )?;
    
    msg!("Swapped {} SOL for {} MUTB", amount_in, mutb_amount);
    Ok(())
}

// Swap MUTB for SOL
fn process_swap_mutb_for_sol(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount_in: u64,
    minimum_amount_out: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get accounts
    let user = next_account_info(account_info_iter)?;
    let user_mutb_account = next_account_info(account_info_iter)?;
    let pool_account = next_account_info(account_info_iter)?;
    let pool_authority = next_account_info(account_info_iter)?;
    let mutb_mint = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    
    // Verify the user is the signer
    if !user.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load the pool state
    let pool_state = SwapPool::try_from_slice(&pool_account.data.borrow())?;
    
    // Verify the accounts
    if !pool_state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    if pool_state.mutb_mint != *mutb_mint.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Calculate the amount of SOL to transfer
    let sol_amount = (amount_in as u128)
        .checked_mul(1_000_000_000)
        .ok_or(ProgramError::ArithmeticOverflow)?
        .checked_div(pool_state.mutb_per_sol as u128)
        .ok_or(ProgramError::ArithmeticOverflow)? as u64;
    
    // Check slippage
    if sol_amount < minimum_amount_out {
        return Err(ProgramError::InvalidInstructionData);
    }
    
    // Derive the authority PDA
    let seeds = &[b"authority", &[pool_state.authority_bump]];
    let signer_seeds = &[&seeds[..]];
    
    // Burn MUTB from the user
    invoke(
        &token_instruction::burn(
            token_program.key,
            user_mutb_account.key,
            mutb_mint.key,
            user.key,
            &[],
            amount_in,
        )?,
        &[
            user_mutb_account.clone(),
            mutb_mint.clone(),
            user.clone(),
            token_program.clone(),
        ],
    )?;
    
    // Transfer SOL from the program to the user
    invoke_signed(
        &system_instruction::transfer(pool_authority.key, user.key, sol_amount),
        &[pool_authority.clone(), user.clone(), system_program.clone()],
        signer_seeds,
    )?;
    
    msg!("Swapped {} MUTB for {} SOL", amount_in, sol_amount);
    Ok(())
}

// Update the exchange rate
fn process_update_exchange_rate(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    mutb_per_sol: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    
    // Get accounts
    let admin = next_account_info(account_info_iter)?;
    let pool_account = next_account_info(account_info_iter)?;
    
    // Verify the admin is the signer
    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Load the pool state
    let mut pool_state = SwapPool::try_from_slice(&pool_account.data.borrow())?;
    
    // Verify the accounts
    if !pool_state.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    // Update the exchange rate
    pool_state.mutb_per_sol = mutb_per_sol;
    
    // Save the updated state
    pool_state.serialize(&mut *pool_account.data.borrow_mut())?;
    
    msg!("Exchange rate updated to {} MUTB per SOL", mutb_per_sol);
    Ok(())
}

// Default implementation for SwapPool
impl Default for SwapPool {
    fn default() -> Self {
        Self {
            is_initialized: false,
            authority_bump: 0,
            mutb_mint: Pubkey::default(),
            mutb_vault: Pubkey::default(),
            mutb_per_sol: 0,
        }
    }
}
