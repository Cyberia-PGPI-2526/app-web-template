import { useEffect, useState } from "react"
import Toast from "../../components/Toast"
import { getOrders } from "../../service/orders.service"

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const loadData = async (pageToLoad = page) => {
    setIsLoading(true)
    try {
      const res = await getOrders(pageToLoad, limit)
      console.log(res)
      setOrders(res.orders || [])
      setTotalPages(res.totalPages || 1)
      setPage(res.page || pageToLoad)
    } catch (e) {
      setToast({ message: "Error cargando órdenes", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData(1)
  }, [])

  const prevPage = () => {
    if (page <= 1) return
    loadData(page - 1)
  }

  const nextPage = () => {
    if (page >= totalPages) return
    loadData(page + 1)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-xl text-[#009BA6]">Cargando órdenes...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#009BA6]">Órdenes</h1>
        <p className="text-gray-600 mt-2">Gestiona las órdenes de los clientes</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#009BA6] text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">Cliente</th>
                <th className="py-4 px-6 text-left font-semibold">Fecha</th>
                <th className="py-4 px-6 text-left font-semibold">Productos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 && (
                <tr>
                  <td
                    className="py-6 px-6 text-center text-gray-600"
                    colSpan="4"
                  >
                    No hay órdenes registradas.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6 text-gray-700">{order.user?.email}</td>
                  <td className="py-4 px-6 text-gray-700">{formatDate(order.order_date)}</td>
                  <td className="py-4 px-6">
                    <ul className="space-y-1">
                      {order.orderProducts.map((op) => (
                        <li key={op.id} className="flex justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <span className="text-gray-700">{op.product.name}</span>
                          <span className="text-gray-500">Cantidad: {op.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <button
          className="px-6 py-3 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={prevPage}
          disabled={page <= 1}
        >
          ← Anterior
        </button>
        <span className="text-lg font-semibold text-gray-700">
          Página {page} de {totalPages}
        </span>
        <button
          className="px-6 py-3 bg-[#009BA6] text-white rounded-lg hover:bg-[#007a82] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={nextPage}
          disabled={page >= totalPages}
        >
          Siguiente →
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
