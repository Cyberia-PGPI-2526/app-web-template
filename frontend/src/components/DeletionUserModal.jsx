import Modal from './Modal'

export default function DeleteUserModal({ isOpen, onClose, onConfirm, userName }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Confirmar eliminación"
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          ¿Estás seguro de que quieres eliminar al usuario
          <span className="font-semibold"> {userName}</span>?
        </p>
        <p className="text-sm text-gray-500">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}