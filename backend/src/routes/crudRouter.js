import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';
import { validate } from '../middleware/validate.js';
import { createCrudService } from '../services/crudService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const managerRoles = ['Administrator', 'Manager'];
const financeRoles = ['Administrator', 'Manager', 'Accountant'];
const receptionRoles = ['Administrator', 'Manager', 'Receptionist'];
const restaurantRoles = ['Administrator', 'Manager', 'Restaurant Staff'];
const gymRoles = ['Administrator', 'Manager', 'Gym Staff'];
const clubRoles = ['Administrator', 'Manager', 'Night Club Staff'];

export const resources = {
  roles: { table: 'roles', columns: ['name', 'description'], roles: ['Administrator'], searchable: ['name'] },
  users: { table: 'users', columns: ['role_id', 'full_name', 'email', 'phone', 'password_hash', 'is_verified'], roles: ['Administrator'], searchable: ['full_name', 'email'] },
  customers: { table: 'customers', columns: ['user_id', 'full_name', 'email', 'phone', 'nationality', 'id_document_type', 'id_document_number', 'address'], roles: receptionRoles, searchable: ['full_name', 'email', 'phone'] },
  'room-types': { table: 'room_types', columns: ['name', 'description', 'base_price', 'capacity', 'amenities'], roles: managerRoles, searchable: ['name'] },
  rooms: { table: 'rooms', columns: ['room_type_id', 'room_number', 'floor', 'status', 'notes'], roles: receptionRoles, searchable: ['room_number', 'status'] },
  reservations: { table: 'reservations', columns: ['customer_id', 'room_id', 'check_in_date', 'check_out_date', 'status', 'total_cost', 'payment_status'], roles: receptionRoles, searchable: ['status', 'payment_status'], orderBy: 'created_at' },
  invoices: { table: 'invoices', columns: ['customer_id', 'reservation_id', 'invoice_number', 'subtotal', 'tax', 'total', 'status'], roles: financeRoles, searchable: ['invoice_number', 'status'] },
  payments: { table: 'payments', columns: ['customer_id', 'invoice_id', 'module', 'method', 'amount', 'reference', 'status'], roles: financeRoles, searchable: ['module', 'method', 'reference'], orderBy: 'paid_at' },
  'menu-items': { table: 'menu_items', columns: ['name', 'category', 'description', 'price', 'is_available'], roles: restaurantRoles, searchable: ['name', 'category'] },
  'restaurant-orders': { table: 'restaurant_orders', columns: ['customer_id', 'table_number', 'status', 'total', 'created_by'], roles: restaurantRoles, searchable: ['table_number', 'status'], orderBy: 'created_at' },
  'restaurant-order-items': { table: 'restaurant_order_items', columns: ['order_id', 'menu_item_id', 'quantity', 'unit_price'], roles: restaurantRoles, searchable: [] },
  'table-reservations': { table: 'table_reservations', columns: ['customer_id', 'table_number', 'party_size', 'reservation_time', 'status'], roles: restaurantRoles, searchable: ['table_number', 'status'] },
  'membership-plans': { table: 'membership_plans', columns: ['name', 'price', 'duration_days'], roles: gymRoles, searchable: ['name'] },
  trainers: { table: 'trainers', columns: ['full_name', 'specialty', 'phone', 'email'], roles: gymRoles, searchable: ['full_name', 'specialty'] },
  'gym-members': { table: 'gym_members', columns: ['customer_id', 'membership_plan_id', 'trainer_id', 'starts_on', 'ends_on', 'payment_status'], roles: gymRoles, searchable: ['payment_status'] },
  'gym-attendance': { table: 'gym_attendance', columns: ['gym_member_id', 'attended_at'], roles: gymRoles, searchable: [], orderBy: 'attended_at' },
  'night-club-events': { table: 'night_club_events', columns: ['title', 'description', 'starts_at', 'ends_at', 'status'], roles: clubRoles, searchable: ['title', 'status'] },
  tickets: { table: 'tickets', columns: ['event_id', 'customer_id', 'ticket_type', 'price', 'status', 'purchased_at'], roles: clubRoles, searchable: ['ticket_type', 'status'] },
  'vip-reservations': { table: 'vip_reservations', columns: ['event_id', 'customer_id', 'guests_count', 'status'], roles: clubRoles, searchable: ['status'] },
  'meeting-rooms': { table: 'meeting_rooms', columns: ['name', 'capacity', 'hourly_rate', 'equipment'], roles: managerRoles, searchable: ['name'] },
  'meeting-bookings': { table: 'meeting_bookings', columns: ['meeting_room_id', 'customer_id', 'starts_at', 'ends_at', 'attendees_count', 'equipment_requested', 'status', 'total_cost'], roles: managerRoles, searchable: ['status'] },
  staff: { table: 'staff', columns: ['user_id', 'full_name', 'department', 'job_title', 'hire_date', 'salary', 'performance_score'], roles: managerRoles, searchable: ['full_name', 'department', 'job_title'] },
  attendance: { table: 'attendance', columns: ['staff_id', 'work_date', 'clock_in', 'clock_out', 'status'], roles: managerRoles, searchable: ['status'] },
  feedback: { table: 'feedback', columns: ['customer_id', 'module', 'rating', 'comments'], roles: managerRoles, searchable: ['module', 'comments'] }
};

export function buildCrudRouter() {
  const router = Router();

  for (const [path, config] of Object.entries(resources)) {
    const service = createCrudService(config);
    const roles = config.roles;

    router.get(`/${path}`, authenticate, authorize(...roles), asyncHandler(async (req, res) => {
      const rows = await service.list(req.query);
      res.json({ data: rows });
    }));

    router.get(`/${path}/:id`, authenticate, authorize(...roles), param('id').isUUID(), validate, asyncHandler(async (req, res) => {
      res.json({ data: await service.get(req.params.id) });
    }));

    router.post(`/${path}`, authenticate, authorize(...roles), audit('create', config.table), asyncHandler(async (req, res) => {
      res.status(201).json({ data: await service.create(req.body) });
    }));

    router.put(`/${path}/:id`, authenticate, authorize(...roles), param('id').isUUID(), validate, audit('update', config.table), asyncHandler(async (req, res) => {
      res.json({ data: await service.update(req.params.id, req.body) });
    }));

    router.delete(`/${path}/:id`, authenticate, authorize(...roles), param('id').isUUID(), validate, audit('delete', config.table), asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      res.status(204).send();
    }));
  }

  return router;
}



