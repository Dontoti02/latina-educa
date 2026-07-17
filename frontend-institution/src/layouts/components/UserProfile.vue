<!-- eslint-disable @typescript-eslint/indent -->
<script setup lang="ts">
import { SessionStore } from '@/common/store'
import { initialAbility } from '@/plugins/casl/ability'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { ImageUtils } from '@/utils/images'
import { changeRole } from '@/utils/system-configuration'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

const session = SessionStore()
const router = useRouter()
const ability = useAppAbility()

const logout = () => {
  session.remove()

  router.push('/login').then(() => {
    localStorage.removeItem('userAbilities')
    ability.update(initialAbility)
  })
}

const userProfileList = computed(() => {
  return [
    { type: 'divider' },
    {
      type: 'navItem',
      icon: 'tabler-user-circle',
      title: 'Mi perfil',
      to: { name: 'personal-profile' },
    },
    ...(session.roles.length > 1
      ? [
        { type: 'divider' },
        ...(session.roles.filter(role => role.id !== session.user?.role.id)).map(role => {
          return {
            type: 'navItem',
            icon: 'tabler-arrows-exchange',
            title: `Cambiar a ${role.name.toLowerCase()}`,
            onClick: async () => {
              await changeRole(role.id, ability)
              router.push('/')
            },
          }
        }),
      ]
      : []),
    { type: 'divider' },
    { type: 'navItem', icon: 'tabler-logout', title: 'Cerrar sesión', onClick: logout },
  ]
})
</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      :color="!(session.user && session.user.photo) ? 'primary' : undefined"
      :variant="!(session.user && session.user.photo) ? 'tonal' : undefined"
    >
      <VImg
        v-if="session.user && session.user.photo"
        :src="ImageUtils.getUrlImage(session.user.photo)"
      />
      <VIcon
        v-else
        icon="tabler-user"
      />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    :color="
                      !(session.user && session.user.photo) ? 'primary' : undefined
                    "
                    :variant="
                      !(session.user && session.user.photo) ? 'tonal' : undefined
                    "
                  >
                    <VImg
                      v-if="session.user && session.user.photo"
                      :src="ImageUtils.getUrlImage(session.user.photo)"
                    />
                    <VIcon
                      v-else
                      icon="tabler-user"
                    />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <template v-if="session.user !== null">
              <VListItemTitle
                class="font-weight-medium text-capitalize"
                style="max-width: 150px;"
              >
                {{ session.user.names.toLowerCase() }}
              </VListItemTitle>
              <VListItemSubtitle class="text-capitalize">
                {{ session.user.role.name.toLowerCase() }}
              </VListItemSubtitle>
            </template>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template
              v-for="item in userProfileList"
              :key="item.title"
            >
              <VListItem
                v-if="item.type === 'navItem'"
                :to="item.to"
                @click="item.onClick && item.onClick()"
              >
                <template #prepend>
                  <VIcon
                    class="me-2"
                    :icon="item.icon"
                    size="22"
                  />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template
                  v-if="item.badgeProps"
                  #append
                >
                  <VBadge v-bind="item.badgeProps" />
                </template>
              </VListItem>

              <VDivider
                v-else
                class="my-2"
              />
            </template>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
