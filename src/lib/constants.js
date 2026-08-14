// Categorías fijas de gasto. La categoría es OPCIONAL en cada gasto.
export const CATEGORIAS = [
  { id: 'carne', label: 'Carne', icon: 'kebab_dining' },
  { id: 'leña', label: 'Leña', icon: 'local_fire_department' },
  { id: 'ensalada', label: 'Ensalada', icon: 'eco' },
  { id: 'fernet', label: 'Fernet', icon: 'local_bar' },
  { id: 'hielo', label: 'Hielo', icon: 'ac_unit' },
  { id: 'picada', label: 'Picada', icon: 'tapas' },
  { id: 'pan', label: 'Pan', icon: 'bakery_dining' },
  { id: 'otros', label: 'Otros', icon: 'more_horiz' }
]

export function categoriaPorId(id) {
  return CATEGORIAS.find((c) => c.id === id) ?? null
}
