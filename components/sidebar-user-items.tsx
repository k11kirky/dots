'use client'

import { Chat, Subject } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'

import { removeChat, shareChat } from '@/app/actions'

import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'

interface SidebarItemsProps {
  users?: Subject[]
}

export function SidebarUserItems({ users }: SidebarItemsProps) {
  if (!users?.length) return null

  return (
    <AnimatePresence>
      {users.map(
        (user, index) =>
        user && (
            <motion.div
              key={user?.id}
              exit={{
                opacity: 0,
                height: 0
              }}
            >
              <div>{user.name}</div>
            </motion.div>
          )
      )}
    </AnimatePresence>
  )
}
