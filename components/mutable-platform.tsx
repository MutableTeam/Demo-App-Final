"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useColyseusLobby } from "@/hooks/useColyseusLobby"

// Define the schema for creating a new game
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Game name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  maxPlayers: z.number().min(2).max(10),
})

// Define the type for the form values
type FormValues = z.infer<typeof formSchema>

interface Game {
  id: string
  name: string
  description: string
  maxPlayers: number
}

interface MutablePlatformProps {
  publicKey: string
  balance: number | null
  provider: any
  connection: any
}

const MutablePlatform: React.FC<MutablePlatformProps> = ({ publicKey, balance, provider, connection }) => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "ws://localhost:2567"
  const username = publicKey ? `Player_${publicKey.substring(0, 4)}` : "Guest"

  const { isConnected, isInLobby, availableGames, createGame, joinGame, connect, joinLobby, disconnect } =
    useColyseusLobby({
      serverUrl,
      username,
      onGameStart: (options) => {
        console.log("Game starting with options:", options)
        // Handle game start
      },
      onError: (error) => {
        toast({
          title: "Connection Error",
          description: error,
          variant: "destructive",
        })
      },
    })
  const { toast } = useToast()

  // State variables
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState<"platform" | "game">("platform")

  // Form for creating a new game
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      maxPlayers: 2,
    },
  })

  // Function to handle creating a new game
  const handleCreateGame = async (values: FormValues) => {
    try {
      setIsLoading(true)

      if (!isConnected) {
        await connect()
      }

      if (!isInLobby) {
        await joinLobby()
      }

      // Create game using Colyseus lobby system
      await createGame({
        gameMode: values.name,
        wager: 0,
        maxPlayers: values.maxPlayers,
      })

      // Show a success toast
      toast({
        title: "Success",
        description: "Game created successfully!",
      })

      // Reset form
      form.reset()
    } catch (error) {
      console.error("Failed to create game:", error)
      toast({
        title: "Error",
        description: "Failed to create the game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayNow = async (gameId: string) => {
    try {
      setIsLoading(true)

      if (!isConnected) {
        await connect()
      }

      if (!isInLobby) {
        await joinLobby()
      }

      // Join the selected game
      await joinGame(gameId)

      toast({
        title: "Success",
        description: "Joined game successfully!",
      })
    } catch (error) {
      console.error("Failed to join game:", error)
      toast({
        title: "Error",
        description: "Failed to join the game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Render the component
  return (
    <>
      {currentView === "platform" ? (
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Mutable Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Welcome to the mutable platform! Create and join games below.
              </p>
              <Separator className="my-4" />

              {/* Game List */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Games</h3>
                {availableGames.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No games available. Create one to get started!</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game Mode</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Players</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableGames.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell>{game.gameMode}</TableCell>
                          <TableCell>{game.hostName}</TableCell>
                          <TableCell>
                            {game.currentPlayers}/{game.maxPlayers}
                          </TableCell>
                          <TableCell>{game.status}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              onClick={() => handlePlayNow(game.id)}
                              disabled={isLoading || game.currentPlayers >= game.maxPlayers}
                            >
                              {isLoading ? "Joining..." : "Join Game"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <Separator className="my-4" />

              <Separator className="my-4" />

              {/* Create New Game */}
              <Drawer>
                <DrawerTrigger asChild>
                  <Button>Create New Game</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Create a New Game</DrawerTitle>
                    <DrawerDescription>Fill out the form below to create a new game.</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleCreateGame)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Game Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter game name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter game description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="maxPlayers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Players</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select max players" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.from({ length: 9 }, (_, i) => i + 2).map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Creating..." : "Create Game"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                  <DrawerFooter>
                    <DrawerClose>Cancel</DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          {/* Game View */}
          <h1>Game Started!</h1>
          {/* Add your game component here */}
        </div>
      )}
    </>
  )
}

export default MutablePlatform
