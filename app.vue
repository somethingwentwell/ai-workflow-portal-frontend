<template>
    <div class="md:hidden">
      <VPImage
        alt="Dashboard"
        width="1280"
        height="1214" class="block"
      />
    </div>
  
    <div class="hidden flex-col md:flex">
      <div class="border-b">
        <div class="flex h-16 items-center px-4">
          <TeamSwitcher />
          <MainNav class="mx-6" />
          <div class="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </div>
        </div>
      </div>
      <NuxtPage />
    </div>
</template>