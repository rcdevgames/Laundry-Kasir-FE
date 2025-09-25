# DataTable Component

Generic reusable table component for displaying data with search, pagination, and mobile-responsive card view.

## Features

- 📱 **Mobile Responsive**: Automatically switches to card view on mobile devices
- 🔍 **Search**: Built-in search functionality with debouncing
- 📄 **Pagination**: Server-side pagination with customizable per-page options
- ⚡ **Loading States**: Loading spinner and empty state handling
- 🎨 **Customizable**: Slots for custom column rendering and mobile cards
- 🔧 **Action Buttons**: Built-in edit and delete actions
- 🎯 **FontAwesome Icons**: Uses FontAwesome icons throughout

## Basic Usage

```vue
<template>
  <DataTable
    title="My Data"
    :data="items"
    :columns="columns"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<script setup>
const columns = [
  { key: 'name', label: 'Name', weight: 'bold' },
  { key: 'email', label: 'Email' },
  { key: 'created_at', label: 'Created', format: 'date' }
];
</script>
```

## Props

### Data Props
- `title` (String, required): Table title
- `data` (Array): Array of data objects
- `columns` (Array, required): Column definitions
- `itemKey` (String, default: 'id'): Unique key for each item
- `loading` (Boolean): Show loading state

### Search Props
- `searchable` (Boolean, default: true): Enable search
- `searchQuery` (String): Current search query
- `searchPlaceholder` (String): Search input placeholder

### Action Props
- `editable` (Boolean, default: true): Show edit buttons
- `deletable` (Boolean, default: true): Show delete buttons

### Pagination Props
- `paginated` (Boolean): Enable pagination
- `currentPage` (Number): Current page number
- `perPage` (Number): Items per page
- `totalItems` (Number): Total items count
- `totalPages` (Number): Total pages count
- `showPerPageSelector` (Boolean, default: true): Show per-page selector

### Empty State Props
- `emptyIcon` (String, default: 'info-circle'): FontAwesome icon for empty state
- `emptyMessage` (String): Message when no data

### Display Props (Mobile Fallback)
- `displayNameKey` (String, default: 'name'): Key for main display text
- `subtitleKey` (String): Key for subtitle text

## Column Definition

```javascript
const columns = [
  {
    key: 'name',           // Object property key
    label: 'Name',         // Column header
    weight: 'bold',        // 'bold' for bold text
    align: 'right',        // 'left', 'center', 'right'
    nowrap: true,          // Prevent text wrapping
    format: 'currency'     // 'currency', 'number', 'date', 'datetime'
  }
];
```

## Events

- `@search(query)`: Search query changed
- `@edit(item)`: Edit button clicked
- `@delete(itemId)`: Delete button clicked
- `@page-change(page)`: Page changed
- `@per-page-change(perPage)`: Per-page count changed

## Slots

### Custom Column Rendering
```vue
<template #column-price="{ value, item }">
  <span class="font-bold text-green-600">
    ${{ value.toFixed(2) }}
  </span>
</template>
```

### Custom Mobile Card
```vue
<template #mobile-card="{ item }">
  <div class="custom-card">
    <h3>{{ item.name }}</h3>
    <p>{{ item.description }}</p>
  </div>
</template>
```

## Examples

### Simple Table
```vue
<DataTable
  title="Users"
  :data="users"
  :columns="[
    { key: 'name', label: 'Name', weight: 'bold' },
    { key: 'email', label: 'Email' }
  ]"
  @edit="editUser"
  @delete="deleteUser"
/>
```

### Table with Pagination
```vue
<DataTable
  title="Products"
  :data="products"
  :columns="productColumns"
  :paginated="true"
  :current-page="page"
  :per-page="perPage"
  :total-items="totalItems"
  :total-pages="totalPages"
  @page-change="handlePageChange"
  @per-page-change="handlePerPageChange"
/>
```

### Table with Custom Columns
```vue
<DataTable
  title="Orders"
  :data="orders"
  :columns="orderColumns"
>
  <template #column-status="{ value }">
    <span class="badge" :class="getStatusClass(value)">
      {{ value }}
    </span>
  </template>
  
  <template #column-total="{ value }">
    <span class="font-bold">
      Rp {{ value.toLocaleString() }}
    </span>
  </template>
</DataTable>
```

### Read-only Table
```vue
<DataTable
  title="Reports"
  :data="reports"
  :columns="reportColumns"
  :editable="false"
  :deletable="false"
  :searchable="false"
/>
```

## Mobile Responsiveness

The component automatically switches to card view on mobile devices (screens smaller than `md` breakpoint). You can customize the mobile card layout using the `mobile-card` slot.

Default mobile behavior uses `displayNameKey` and `subtitleKey` props for fallback display when no custom mobile card slot is provided.

## Styling

The component uses Tailwind CSS classes and is fully responsive. Colors and spacing follow the application's design system with:

- Indigo for primary actions and pagination
- Red for delete actions
- Gray for neutral elements
- Proper hover states and transitions