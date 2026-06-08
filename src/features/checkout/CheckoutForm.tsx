import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'
import { StepScreen } from '@/components/StepScreen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrderSummary } from '@/features/checkout/OrderSummary'
import { useFlowStore } from '@/store/useFlowStore'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z
    .string()
    .min(6, 'Enter a valid phone number')
    .regex(/^[+\d][\d\s().-]{5,}$/, 'Enter a valid phone number'),
  address: z.string().min(4, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
})

type FormValues = z.infer<typeof schema>

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="label text-danger">{error}</p>}
    </div>
  )
}

export function CheckoutForm() {
  const { order, updateOrder, next } = useFlowStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: order,
    mode: 'onBlur',
  })

  const onSubmit = (values: FormValues) => {
    updateOrder(values)
    next()
  }

  return (
    <StepScreen
      step={4}
      kicker="Step 04 · Checkout"
      title="Your Details"
      subtitle="Where do we ship it? No account needed."
      footer={
        <Button
          type="submit"
          form="checkout-form"
          className="w-full"
          size="lg"
        >
          Review Order
          <ArrowRight className="size-5" strokeWidth={1.5} />
        </Button>
      }
    >
      <div className="mb-8">
        <OrderSummary />
      </div>

      <hr className="rule mb-8 max-w-[8rem]" />

      <form
        id="checkout-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" error={errors.firstName?.message}>
            <Input
              placeholder="Alex"
              aria-invalid={!!errors.firstName}
              {...register('firstName')}
            />
          </Field>
          <Field label="Last name" error={errors.lastName?.message}>
            <Input
              placeholder="Martin"
              aria-invalid={!!errors.lastName}
              {...register('lastName')}
            />
          </Field>
        </div>

        <Field label="Phone number" error={errors.phone?.message}>
          <Input
            type="tel"
            placeholder="+33 6 12 34 56 78"
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
        </Field>

        <Field label="Shipping address" error={errors.address?.message}>
          <Input
            placeholder="12 Rue du Stade"
            aria-invalid={!!errors.address}
            {...register('address')}
          />
        </Field>

        <div className="grid grid-cols-[1fr_1fr] gap-4">
          <Field label="City" error={errors.city?.message}>
            <Input
              placeholder="Paris"
              aria-invalid={!!errors.city}
              {...register('city')}
            />
          </Field>
          <Field label="Postal code" error={errors.postalCode?.message}>
            <Input
              placeholder="75001"
              aria-invalid={!!errors.postalCode}
              {...register('postalCode')}
            />
          </Field>
        </div>

        <Field label="Country" error={errors.country?.message}>
          <Input
            placeholder="France"
            aria-invalid={!!errors.country}
            {...register('country')}
          />
        </Field>
      </form>
    </StepScreen>
  )
}
