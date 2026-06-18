import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Circle, Eye, EyeOff } from 'lucide-react'
import type { AdminRole } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  ADMIN_ROLES,
  PASSWORD_RULES,
  adminCreateSchema,
  adminEditSchema,
} from '@/features/admin/schemas'
import type { AdminFormValues } from '@/features/admin/schemas'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/store/useAdminStore'
import { useAdminsStore } from '@/store/useAdminsStore'
import { useToastStore } from '@/store/useToastStore'

const FORM_ID = 'admin-form'

/*
  Create / edit an admin account. Mirrors TeamForm: an outer Dialog with a keyed
  body so switching rows resets the form. Field hierarchy: name → email → role →
  password section (a live requirements checklist + confirm). On create a valid
  password is required; on edit it's optional ("leave blank to keep current").
  Duplicate-email errors come back from the store and surface on the email field.
*/
export function AdminForm() {
  const adminEdit = useAdminStore((s) => s.adminEdit)
  const close = useAdminStore((s) => s.closeAdmin)
  const open = adminEdit !== null
  const isNew = adminEdit === 'new'

  return (
    <Dialog
      open={open}
      onClose={close}
      size="sm"
      title={isNew ? 'New admin' : 'Edit admin'}
      footer={
        open ? (
          <>
            <Button variant="outline" size="sm" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} size="sm">
              {isNew ? 'Create admin' : 'Save admin'}
            </Button>
          </>
        ) : undefined
      }
    >
      {open && <AdminFormBody key={adminEdit} id={adminEdit} />}
    </Dialog>
  )
}

function AdminFormBody({ id }: { id: string | 'new' }) {
  const isNew = id === 'new'
  const existing = useAdminsStore((s) => (isNew ? undefined : s.admins.find((a) => a.id === id)))
  const addAdmin = useAdminsStore((s) => s.addAdmin)
  const updateAdmin = useAdminsStore((s) => s.updateAdmin)
  const close = useAdminStore((s) => s.closeAdmin)
  const push = useToastStore((s) => s.push)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(isNew ? adminCreateSchema : adminEditSchema),
    mode: 'onBlur',
    defaultValues: existing
      ? {
          name: existing.name ?? '',
          email: existing.email,
          role: existing.role,
          password: '',
          confirmPassword: '',
        }
      : { name: '', email: '', role: 'admin', password: '', confirmPassword: '' },
  })

  const values = watch()
  // On edit, only show the requirements checklist once the user starts typing a
  // new password (a blank password keeps the current one).
  const showChecklist = isNew || (values.password ?? '').length > 0

  const onSubmit = (v: AdminFormValues) => {
    const input = { email: v.email, name: v.name, role: v.role, password: v.password }
    const res = isNew ? addAdmin(input) : updateAdmin(id, input)
    if (!res.ok) {
      setError('email', { type: 'manual', message: res.error })
      return
    }
    push(isNew ? 'Admin created' : 'Admin saved')
    close()
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* 1 — Name */}
      <Field label="Name" error={errors.name?.message} htmlFor="admin-name" hint="Optional">
        <Input
          id="admin-name"
          placeholder="Alex Martin"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'admin-name-error' : undefined}
          {...register('name')}
        />
      </Field>

      {/* 2 — Email */}
      <Field label="Email" error={errors.email?.message} htmlFor="admin-email">
        <Input
          id="admin-email"
          type="email"
          autoComplete="off"
          placeholder="name@posterlab.fr"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'admin-email-error' : undefined}
          {...register('email')}
        />
      </Field>

      {/* 3 — Role */}
      <Field label="Role" error={errors.role?.message} htmlFor="admin-role">
        <Select
          id="admin-role"
          aria-invalid={!!errors.role}
          value={values.role}
          onChange={(v) => setValue('role', v as AdminRole, { shouldDirty: true, shouldValidate: true })}
          options={ADMIN_ROLES}
        />
      </Field>

      {/* 4 — Password section */}
      <div className="space-y-4 border-t border-line pt-5">
        <Field
          label={isNew ? 'Password' : 'New password'}
          error={errors.password?.message}
          htmlFor="admin-password-field"
          hint={isNew ? undefined : 'Leave blank to keep current'}
        >
          <PasswordInput
            id="admin-password-field"
            field={register('password')}
            invalid={!!errors.password}
            placeholder={isNew ? 'Create a password' : '••••••••'}
          />
        </Field>

        {showChecklist && <PasswordChecklist value={values.password ?? ''} />}

        <Field
          label="Confirm password"
          error={errors.confirmPassword?.message}
          htmlFor="admin-confirm-field"
        >
          <PasswordInput
            id="admin-confirm-field"
            field={register('confirmPassword')}
            invalid={!!errors.confirmPassword}
            placeholder="Re-enter the password"
          />
        </Field>
      </div>
    </form>
  )
}

/* A masked input with a show/hide eye toggle (same pattern as the login screen). */
function PasswordInput({
  id,
  field,
  invalid,
  placeholder,
}: {
  id: string
  field: UseFormRegisterReturn
  invalid: boolean
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={placeholder}
        className="pr-12"
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        {...field}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className={cn(
          'absolute right-0 top-0 grid h-12 w-11 place-items-center',
          'cursor-pointer text-mute transition-colors hover:text-cream',
          'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cream',
        )}
      >
        {show ? <EyeOff className="size-5" strokeWidth={1.5} /> : <Eye className="size-5" strokeWidth={1.5} />}
      </button>
    </div>
  )
}

/* Live requirements list — a green check once each rule is met. */
function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="space-y-1.5">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value)
        return (
          <li
            key={rule.id}
            className={cn('flex items-center gap-2 t-help', ok ? 'text-success' : 'text-mute')}
          >
            {ok ? (
              <Check className="size-4 shrink-0" strokeWidth={2.5} />
            ) : (
              <Circle className="size-4 shrink-0" strokeWidth={1.5} />
            )}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
