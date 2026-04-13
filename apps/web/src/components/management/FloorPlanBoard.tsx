import { Order, Reservation, RestaurantTable } from '../../types/management';
import { StatusBadge } from './StatusBadge';

function tableShapeClass(shape: RestaurantTable['shape']) {
  if (shape === 'round') return 'rounded-full';
  if (shape === 'booth') return 'rounded-[1.75rem]';
  return 'rounded-[1.25rem]';
}

function tableTone(status: RestaurantTable['status']) {
  return {
    available: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    reserved: 'bg-sky-100 border-sky-300 text-sky-900',
    occupied: 'bg-rose-100 border-rose-300 text-rose-900',
    cleaning: 'bg-amber-100 border-amber-300 text-amber-900'
  }[status];
}

export function FloorPlanBoard({
  tables,
  reservations,
  orders,
  selectedTableId,
  onSelect,
  onReservationDrop,
  onOrderDrop
}: {
  tables: RestaurantTable[];
  reservations: Reservation[];
  orders: Order[];
  selectedTableId: string | null;
  onSelect: (tableId: string) => void;
  onReservationDrop: (reservationId: string, tableId: string) => void;
  onOrderDrop: (orderId: string, tableId: string) => void;
}) {
  const zones = Array.from(new Set(tables.map((table) => table.zone)));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <p className="eyebrow">Reservations a placer</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {reservations.map((reservation) => (
              <button
                key={reservation.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', `reservation:${reservation.id}`)}
                className="rounded-full border border-forest/10 bg-sand px-4 py-2 text-sm font-semibold text-forest"
              >
                {reservation.guestName} · {reservation.guests}p
              </button>
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <p className="eyebrow">Clients a deplacer</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {orders.filter((order) => order.status !== 'closed').map((order) => (
              <button
                key={order.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/plain', `order:${order.id}`)}
                className="rounded-full border border-forest/10 bg-white px-4 py-2 text-sm font-semibold text-forest"
              >
                {order.customerName} · {order.tableLabel}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {zones.map((zone) => (
          <section key={zone} className="surface-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Zone</p>
                <h3 className="mt-2 font-display text-2xl text-forest">{zone}</h3>
              </div>
            </div>
            <div className="relative min-h-[22rem] rounded-[1.75rem] border border-dashed border-forest/15 bg-[radial-gradient(circle_at_top_left,rgba(216,162,94,0.12),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(244,236,221,0.95))] p-4">
              {tables.filter((table) => table.zone === zone).map((table) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => onSelect(table.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const data = event.dataTransfer.getData('text/plain');
                    if (data.startsWith('reservation:')) onReservationDrop(data.replace('reservation:', ''), table.id);
                    if (data.startsWith('order:')) onOrderDrop(data.replace('order:', ''), table.id);
                  }}
                  className={[
                    'absolute border-2 p-3 text-left shadow-sm transition hover:scale-[1.02]',
                    tableShapeClass(table.shape),
                    tableTone(table.status),
                    selectedTableId === table.id ? 'ring-4 ring-clay/30' : ''
                  ].join(' ')}
                  style={{ left: `${table.posX}%`, top: `${table.posY}%`, width: `${table.width}%`, height: `${table.height}%` }}
                >
                  <p className="font-display text-lg">{table.label}</p>
                  <p className="text-xs font-medium opacity-75">{table.seats} couverts</p>
                  <div className="mt-2">
                    <StatusBadge value={table.status} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
