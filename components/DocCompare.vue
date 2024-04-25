<script setup lang="ts">
import { h, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { cn } from '@/lib/utils'

const config = useRuntimeConfig()

// onMounted(() => {
//  console.log(config.public.DOC_COMPARE_WORKFLOW_KEY)
//  })

const { handleSubmit } = useForm({
  initialValues: {
    image1: '',
    image2: '',
    query: '',
  },
})

const resetForm = () => {
    console.log('resetting form')
  image1.value = ''
  image2.value = ''
  query.value = ''
  output.value = ''
  showResult.value = false
  isLoading.value = false
}

const progress = ref(0)
const isLoading = ref(false)
const showResult = ref(false)
const image1 = ref('')
const image2 = ref('')
const query = ref('')
const output = ref('')

const image1Url = ref('')
const image2Url = ref('')

const fileChange1 = (value: any) => {
  image1.value = value
}

const fileChange2 = (value: any) => {
  image2.value = value
}

const onSubmit = handleSubmit(async (values) => {
  const sasToken = 'sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-06-30T12:26:53Z&st=2024-04-23T04:26:53Z&spr=https&sig=DwEbBIMfA4E47E8xKxvThT8Mn9dMCNzFZ7b6mmxPLL8%3D'
  const storageAccountName = 'difyworkflowstor'
  const containerName = 'temp'
  showResult.value = false
  isLoading.value = true

  const progressInterval = setInterval(() => {
    if (progress.value < 95) { // Ensure it doesn't exceed 100 before the workflow result is received
      progress.value += 5;
    }
  }, 1000);

  // Upload image1
  const blobName1 = image1.value.name
  const blobUrl1 = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName1}?${sasToken}`
  await fetch(blobUrl1, {
    method: 'PUT',
    body: image1.value,
    headers: { 'x-ms-blob-type': 'BlockBlob' },
  })
  image1Url.value = blobUrl1.split('?')[0]

  // Upload image2
  const blobName2 = image2.value.name
  const blobUrl2 = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName2}?${sasToken}`
  await fetch(blobUrl2, {
    method: 'PUT',
    body: image2.value,
    headers: { 'x-ms-blob-type': 'BlockBlob' },
  })
  image2Url.value = blobUrl2.split('?')[0]

  let workflowResult = {}

  try {
    let workflowCall = await fetch('/api/workflows/run', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + config.public.DOC_COMPARE_WORKFLOW_KEY,
        },
        body: JSON.stringify({
            inputs: {
                imageLink1: image1Url.value,
                imageLink2: image2Url.value,
                query: query.value
            },
            response_mode: "blocking",
            user: "test-nuxt-client"
        }),
    })

    workflowResult = await workflowCall.json()
    output.value = workflowResult.data.outputs.Result
  }
    catch (e) {
        output.value = JSON.stringify(e, null, 2)
    }

  progress.value = 100
  isLoading.value = false
  clearInterval(progressInterval);
  progress.value = 0
  showResult.value = true

  console.log(workflowResult)
})

</script>

<template>
<div>
<h3 class="text-lg font-medium">
    Document Analysis
</h3>
<p class="text-sm text-muted-foreground">
    Upload 1-2 images and a query to get insights from the images
</p>
</div>
<form class="space-y-8" @submit="onSubmit">
  <FormField v-slot="{ componentField }" name="image1">
    <FormItem>
      <FormLabel>Image 1</FormLabel>
      <FormControl>
        <Input @change="fileChange1($event.target.files[0])" id="image1" type="file" accept="image/*" />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>

  <FormField v-slot="{ componentField }" name="image2">
    <FormItem>
      <FormLabel>Image 2</FormLabel>
      <FormControl>
        <Input @change="fileChange2($event.target.files[0])" id="image2" type="file" accept="image/*" />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>

  <FormField v-slot="{ componentField }" name="query">
    <FormItem>
      <FormLabel>Query</FormLabel>
      <FormControl>
        <Input type="text" placeholder="Enter your query" v-bind="componentField" v-model="query" />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>

  <div class="flex gap-2 justify-start">
    <Button type="submit">
      Process
    </Button>

    <Button
      type="button"
      variant="outline"
      @click="resetForm"
    >
      Reset
    </Button>

  </div>
  <div class="flex gap-2 justify-start">
    
  </div>
  <Progress v-if="isLoading" v-model="progress" class="w-3/5" />
  <div v-if="showResult" class="grid w-full gap-1.5">
    <Label for="message">Result</Label>
    <Textarea readonly placeholder="Output will be displayed here" v-model="output" rows="10" />
  </div>
  
</form>
</template>