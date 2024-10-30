'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AI_MODELS = [
  { value: 'claude', label: 'Claude' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'gpt4', label: 'GPT-4' },
  { value: 'palm', label: 'PaLM' },
]

interface Keyword {
  keyword: string;
  category: string;
}

export function KeywordResearchToolComponent() {
  const [selectedModel, setSelectedModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [niche, setNiche] = useState('')
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
  }

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value)
  }

  const handleNicheChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNiche(event.target.value)
  }

  const handleStartResearch = async () => {
    setIsLoading(true)
    // Simulating API call to AI model for keyword research
    await new Promise(resolve => setTimeout(resolve, 2000))
    const simulatedKeywords = [
      { keyword: 'best organic dog food', category: 'Pet Nutrition' },
      { keyword: 'homemade dog treats recipes', category: 'Pet Care' },
      { keyword: 'dog training tips for beginners', category: 'Pet Training' },
      { keyword: 'affordable dog grooming near me', category: 'Pet Services' },
      { keyword: 'dog-friendly hiking trails', category: 'Pet Activities' },
    ]
    setKeywords(simulatedKeywords)
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Keyword Research Tool</CardTitle>
        <CardDescription>Discover low-competition keywords for your niche</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-model">Select AI Model</Label>
            <Select onValueChange={handleModelChange}>
              <SelectTrigger id="ai-model">
                <SelectValue placeholder="Choose an AI model" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input id="api-key" type="password" value={apiKey} onChange={handleApiKeyChange} placeholder="Enter your API key" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="niche">Your Niche</Label>
            <Input id="niche" value={niche} onChange={handleNicheChange} placeholder="e.g., Organic Pet Food" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartResearch} disabled={!selectedModel || !apiKey || !niche || isLoading}>
          {isLoading ? 'Researching...' : 'Start Keyword Research'}
        </Button>
      </CardFooter>
      {keywords.length > 0 && (
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Keywords</TabsTrigger>
              {Array.from(new Set(keywords.map(k => k.category))).map(category => (
                <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all">
              <ul className="list-disc pl-5">
                {keywords.map((keyword, index) => (
                  <li key={index}>{keyword.keyword} - <span className="text-sm text-muted-foreground">{keyword.category}</span></li>
                ))}
              </ul>
            </TabsContent>
            {Array.from(new Set(keywords.map((k): string => k.category))).map(category => (
              <TabsContent key={category} value={category}>
                <ul className="list-disc pl-5">
                  {keywords.filter(k => k.category === category).map((keyword, index) => (
                    <li key={index}>{keyword.keyword}</li>
                  ))}
                </ul>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}
