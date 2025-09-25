import React from 'react'
import { User } from '../../api/endpoints'
import { Modal } from '../ui/Modal'
import { UserProfile } from '../cards/UserProfile'

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onDelete,
}) => {
  const handleEdit = (user: User) => {
    onEdit?.(user)
    onClose()
  }

  const handleDelete = (user: User) => {
    onDelete?.(user)
    onClose()
  }

  if (!user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Información del Usuario"
      size="xl"
    >
      <UserProfile
        user={user}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showActions={true}
      />
    </Modal>
  )
}
