import { Box, Flex, Heading, Text, Image } from "@chakra-ui/react"

interface Platform {
  title: string
  icon: string
  description: string
  image: string
}

const platforms: Platform[] = [
  {
    title: "Games",
    icon: "/icons/desktop.svg",
    description: "Immersive gaming experiences on your computer.",
    image: "/images/desktop-gaming.jpg",
  },
  {
    title: "Web",
    icon: "/icons/web.svg",
    description: "Access our platform through any modern web browser.",
    image: "/images/web-platform.jpg",
  },
]

const PlatformSelector = () => {
  return (
    <Box py={12} bg="gray.50">
      <Heading textAlign="center" mb={8}>
        Choose Your Platform
      </Heading>
      <Flex justify="center" gap={8} wrap="wrap">
        {platforms.map((platform) => (
          <Box
            key={platform.title}
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg="white"
            boxShadow="md"
          >
            <Image src={platform.image || "/placeholder.svg"} alt={platform.title} h={200} w="full" objectFit="cover" />

            <Box p={6}>
              <Flex align="center" mb={4}>
                <Image src={platform.icon || "/placeholder.svg"} alt={platform.title} boxSize={6} mr={2} />
                <Heading as="h3" size="md">
                  {platform.title}
                </Heading>
              </Flex>
              <Text>{platform.description}</Text>
            </Box>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}

export default PlatformSelector
