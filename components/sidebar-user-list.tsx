import { clearUsers, getChats, getUsers } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { cache } from 'react'
import { SidebarUserItems } from './sidebar-user-items'
import { ClearUsers } from './clear-users'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}

const loadUsers = cache(async (userId?: string) => {
  return await getUsers(userId)
})

export async function SidebarUserList({ userId }: SidebarListProps) {
  const users = await loadUsers(userId)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {users?.length ? (
          <div className="space-y-2 px-2">
            <SidebarUserItems users={users} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No user history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        {/* Clear user info */}
        <ClearUsers clearUsers={clearUsers} isEnabled={users?.length > 0} />
      </div>
    </div>
  )
}
