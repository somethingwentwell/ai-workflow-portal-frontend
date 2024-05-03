<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Item {
  title: string
  href: string
}

const $route = useRoute()

const sidebarNavItems: Item[] = [
//   {
//     title: 'Profile',
//     href: '/forms/forms',
//   },
//   {
//     title: 'Account',
//     href: '/forms/account',
//   },
//   {
//     title: 'Appearance',
//     href: '/forms/appearance',
//   },
//   {
//     title: 'Notifications',
//     href: '/forms/notifications',
//   },
//   {
//     title: 'Display',
//     href: '/forms/display',
//   },
{
    title: 'GPT4 Vision',
    href: '/forms/gpt4vision',
  },
  // {
  //   title: 'Ask/Compare the Document',
  //   href: '/forms/documentcompare',
  // },
  {
    title: 'Hiring Requirements & JD Creation',
    href: '/forms/hiringrequirements',
  },
  {
    title: 'AI Talent Search & Shortlisting',
    href: '/forms/talentsearch',
  },
]
</script>

<template>
  <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
    <Button
      v-for="item in sidebarNavItems"
      :key="item.title"
      as="a"
      :href="item.href"
      variant="ghost"
      :class="cn(
        'w-full text-left justify-start',
        $route.path === `${item.href}.html` && 'bg-muted hover:bg-muted',
      )"
    >
      {{ item.title }}
    </Button>
  </nav>
</template>