import emitter from '@/common/util/emitter.service'
import type { Menu, Option } from '@/models/login'
import type { Subjects, UserAbility } from '@/plugins/casl/AppAbility'

const recursiveOptions = (options: Option[]): UserAbility[] => {
  const abilities: UserAbility[] = []

  options.forEach(o => {
    abilities.push({
      action: 'manage',
      subject: o.name_url as Subjects,
    })

    if (o.options.length > 0)
      abilities.push(...recursiveOptions(o.options))
  })

  return abilities
}

export const getUserAbilities = (menu: Menu[]): UserAbility[] => {
  const abilities: UserAbility[] = [{
    action: 'read',
    subject: 'Auth',
  }]

  menu.forEach(m => {
    abilities.push({
      action: 'manage',
      subject: m.name as Subjects,
    })

    if(m.url) {
      emitter.emit('updateUrlLinkNav', {
        url: m.url,
        subject: m.name,
      })
    }

    if(m.options && m.options.length > 0)
      abilities.push(...recursiveOptions(m.options))
  })

  return abilities
}
