'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { updateUserRole, deleteUser } from '@/app/admin/dashboard/users/actions'
import type { UserRole } from '@/types/database'

interface UserActionsProps {
  userId: string
  userName: string
  currentRole: UserRole
  currentUserId: string
}

export function UserActions({
  userId,
  userName,
  currentRole,
  currentUserId,
}: UserActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole)
  const isSelf = userId === currentUserId

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole
    setSelectedRole(newRole)

    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res?.error) {
        alert(res.error)
        setSelectedRole(currentRole) // Revert on failure
      }
    })
  }

  const handleDelete = () => {
    if (isSelf) {
      alert('Bạn không thể xóa tài khoản của chính mình.')
      return
    }

    const confirmed = confirm(
      `Bạn có chắc chắn muốn xóa thành viên "${userName}" khỏi hệ thống? Thao tác này không thể hoàn tác.`
    )
    if (!confirmed) return

    startTransition(async () => {
      const res = await deleteUser(userId)
      if (res?.error) {
        alert(res.error)
      }
    })
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Role Selector */}
      <div className="relative">
        <select
          value={selectedRole}
          onChange={handleRoleChange}
          disabled={isPending || isSelf}
          title={isSelf ? 'Không thể đổi vai trò của chính mình' : 'Thay đổi vai trò'}
          className="h-8 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 cursor-pointer"
        >
          <option value="admin">Quản trị viên (Admin)</option>
          <option value="editor">Biên tập viên (Editor)</option>
          <option value="user">Nhân viên (User)</option>
        </select>
      </div>

      {/* Delete User Button */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending || isSelf}
        title={isSelf ? 'Không thể tự xóa tài khoản' : `Xóa tài khoản ${userName}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}
