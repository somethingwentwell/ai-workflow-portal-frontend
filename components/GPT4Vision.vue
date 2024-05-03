<script setup lang="ts">
import { h, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { cn } from '@/lib/utils'

const config = useRuntimeConfig()

const progress = ref(0)
const isLoading = ref(false)
const showResult = ref(false)
const images = ref([])
const query = ref('')
const output = ref('')

const imageUrls = ref<string[]>([])

const payload = ref({
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "You are an AI assistant that helps people find information."
        }
      ]
    }
  ],
  "temperature": 0,
  "top_p": 0.95,
  "max_tokens": 1000
}
)

const messages = ref<any[]>([
  {
    title: 'This is GPT 4 Vision Bot. How can I help you today?',
    description: 'SB',
    isUser: false,
  }
])

const reset = () => {
  messages.value = [
    {
      title: 'This is GPT 4 Vision Bot. How can I help you today?',
      description: 'SB',
      isUser: false,
    }
  ]
  query.value = ''
}

const sendMessage = async () => {

  let userContent: any = {
      "role": "user",
      "content": []
    }

  for (const image of images.value) {
    const reader = new FileReader()
    reader.readAsDataURL(image)
    await new Promise((resolve) => {
      reader.onload = async () => {
        const base64 = reader.result
        console.log(base64)
        await userContent.content.push({
          type: 'image_url',
          image_url: {
            url: base64,
          }
        })
        resolve(null)
      }
    })
  }

  let userMessage = {
    title: query.value,
    description: 'You',
    isUser: true,
  }

  for (const image of images.value) {
    userMessage.images = userMessage.images || []
    userMessage.images.push(URL.createObjectURL(image))
  }

  messages.value.unshift(
    userMessage
  )
  query.value = ''

  userContent.content.push({
    type: 'text',
    text: query.value,
  })

  payload.value.messages.push(userContent)

  messages.value.unshift({
        title: '###Loading###',
        description: 'SB',
        isUser: false,
      })

  let jsonBody = JSON.stringify(payload.value)

  const response = await fetch(config.public.AZURE_OAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.public.GPT4TURBO_KEY
    },
    body: jsonBody
  })

  const data = await response.json()

  console.log(data)
  images.value = []

  try {
    if (data.choices[0].message.content) {
      let responseStr = data.choices[0].message.content
      let responseArray = responseStr.split('\n')
      let responseArrayLength = responseArray.length
      let response = ''
      for (let i = 0; i < responseArrayLength; i++) {
        if (responseArray[i].length > 0) {
          let words = responseArray[i].split(' ')
          let temp = ''
          for (let j = 0; j < words.length; j++) {
            temp += words[j] + ' '
            if ((j + 1) % 10 === 0) {
              response += temp.trim() + '\n'
              temp = ''
            }
          }
          if (temp.trim() !== '') {
            response += temp.trim() + '\n'
          }
        }
      }


      messages.value.shift()

      messages.value.unshift({
        title: response,
        description: 'SB',
        isUser: false,
      })
    }
  } catch (e) {
    console.log(e)
    messages.value.unshift({
        title: 'Something went wrong.',
        description: 'SB',
        isUser: false,
      })
  }


}

const fileChange = (value: any) => {
  images.value = value
  
  console.log(images.value)
}


</script>

<style scoped>
.messages-area {
  max-height: 40vh; /* adjust this value as needed */
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  padding: 10px;
}

.message-item {
  margin-bottom: 10px;
}

.message-content {
  margin-left: 10px;
}
</style>

<template>
<div>
<h3 class="text-lg font-medium">
    GPT 4 Vision
</h3>
<ResizablePanelGroup
    id="vertical-demo-group-1"
    direction="vertical"
    class="min-h-[65vh] min-w-[100%]rounded-lg border"
  >
    <ResizablePanel id="vertical-demo-panel-1" :default-size="65">

        <div class="messages-area">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="{
              'message-item': true,
              'flex justify-end': message.isUser,
              'flex justify-start': !message.isUser
            }"
          >
            <div class="message-content rounded-md border" style="max-width: 90%;">
              <div v-if="message.images && message.images.length > 0">
                <div v-for="image in message.images" :key="image">
                  <img :src="image" alt="Image" class="m-2" style="max-height: 50vh;" />
                </div>
              </div>
              <p v-if="message.title=='###Loading###'" class="text-sm font-medium leading-none m-2 space-y-2">
                <Skeleton class="h-4 w-[300px]" />
                <Skeleton class="h-4 w-[250px]" />
                <Skeleton class="h-4 w-[350px]" />
              </p>
              <p v-else class="text-sm font-medium leading-none m-2">
                <pre>{{ message.title }}</pre>
              </p>
              <p class="text-sm text-muted-foreground  m-2">
                {{ message.description }}
              </p>
            </div>
          </div>
        </div>

    </ResizablePanel>
    <ResizableHandle id="vertical-demo-handle-1" />
    <ResizablePanel id="vertical-demo-panel-2" :default-size="35">
      <div class="flex h-full items-center justify-center p-6">
        <div className="grid w-full gap-2">
          <Textarea v-model="query" placeholder="Type your message here." />
          <div class="flex gap-2 justify-start mt-4">
            <Button variant="outline" @click="reset">
              Reset
            </Button>
            <Input @change="fileChange($event.target.files)" id="image" type="file" accept="image/*" ref="inputFiles" multiple />
            <Button @click="sendMessage">
              Send
            </Button>

          </div>
        </div>
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
</div>

  
</template>