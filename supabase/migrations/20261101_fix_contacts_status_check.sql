-- Migration: Update contacts_status_check constraint to allow all application statuses
-- Allows: pending (Chờ xử lý), contacted (Đã liên hệ), reviewed (Hoàn tất / Đã duyệt), rejected (Từ chối / Hủy), closed (Đã đóng)

ALTER TABLE public.contacts 
  DROP CONSTRAINT IF EXISTS contacts_status_check;

ALTER TABLE public.contacts 
  ADD CONSTRAINT contacts_status_check 
  CHECK (status IN ('pending', 'contacted', 'reviewed', 'rejected', 'closed'));
