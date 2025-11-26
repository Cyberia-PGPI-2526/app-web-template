import { useEffect, useState } from "react"
import { getMyOrders } from "../../service/orders.service"

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      const data = await getMyOrders(page, 5)
      if (data.error) {
        setError(data.error)
      } else {
        setOrders(data.orders || [])
        setTotalPages(data.totalPages || 1)
      }
      setLoading(false)
    }

    fetchData()
  }, [page])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#009BA6] mb-6 text-center">
        Mis Pedidos
      </h1>

      {loading && (
        <div className="text-center text-gray-500">Cargando pedidos...</div>
      )}

      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-gray-500 text-center">
          No tienes pedidos registrados.
        </div>
      )}

      <div className="grid gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-md rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Pedido #{order.id}
              </h2>
              <span className="text-gray-500 text-sm">
                {formatDate(order.order_date)}
              </span>
            </div>

            <div className="space-y-2">
              {order.orderProducts.map((op) => (
                <div
                  key={op.id}
                  className="flex justify-between bg-gray-50 p-3 rounded-lg border border-gray-100"
                >
                  <span className="text-gray-700">{op.product.name}</span>
                  <span className="text-gray-500">Cantidad: {op.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-3">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-xl text-white font-medium ${
              page === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#009BA6] hover:bg-[#007E87]"
            }`}
          >
            Anterior
          </button>

          <span className="text-gray-700">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-xl text-white font-medium ${
              page === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#009BA6] hover:bg-[#007E87]"
            }`}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
