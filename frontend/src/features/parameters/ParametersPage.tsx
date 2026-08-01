import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiErrorMessage } from '@/lib/api-error';
import {
  fetchCompanySettings,
  updateCompanySettings,
} from './company-settings-api';
import {
  companySettingsSchema,
  companySettingsToFormValues,
  formToUpdateCompanySettingsPayload,
  type CompanySettingsFormValues,
} from './company-settings-schemas';

const COMPANY_SETTINGS_QUERY_KEY = ['company-settings'] as const;

export function ParametersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: COMPANY_SETTINGS_QUERY_KEY,
    queryFn: fetchCompanySettings,
    retry: 1,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      legalName: '',
      tradeName: '',
      cnpj: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    if (data) {
      reset(companySettingsToFormValues(data));
    }
  }, [data, reset]);

  const saveMutation = useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(COMPANY_SETTINGS_QUERY_KEY, settings);
      reset(companySettingsToFormValues(settings));
    },
  });

  const onSubmit = async (values: CompanySettingsFormValues) => {
    try {
      await saveMutation.mutateAsync(formToUpdateCompanySettingsPayload(values));
    } catch (error) {
      setError('root', {
        message: getApiErrorMessage(error),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Parâmetros</h2>
        <p className="text-sm text-muted-foreground">
          Dados da contratada usados na geração de contratos e documentos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : isError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Não foi possível carregar os parâmetros. Salve os dados abaixo para
              configurar a empresa.
            </p>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="legalName" className="text-sm font-medium">
                  Razão social
                </label>
                <Input
                  id="legalName"
                  aria-invalid={!!errors.legalName}
                  {...register('legalName')}
                />
                {errors.legalName && (
                  <p className="text-sm text-destructive">
                    {errors.legalName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="tradeName" className="text-sm font-medium">
                  Nome fantasia
                </label>
                <Input id="tradeName" {...register('tradeName')} />
              </div>

              <div className="space-y-2">
                <label htmlFor="cnpj" className="text-sm font-medium">
                  CNPJ
                </label>
                <Input
                  id="cnpj"
                  placeholder="Somente números"
                  aria-invalid={!!errors.cnpj}
                  {...register('cnpj')}
                />
                {errors.cnpj && (
                  <p className="text-sm text-destructive">{errors.cnpj.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-6">
              <div className="space-y-2 sm:col-span-4">
                <label htmlFor="street" className="text-sm font-medium">
                  Logradouro
                </label>
                <Input
                  id="street"
                  aria-invalid={!!errors.street}
                  {...register('street')}
                />
                {errors.street && (
                  <p className="text-sm text-destructive">
                    {errors.street.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-1">
                <label htmlFor="number" className="text-sm font-medium">
                  Número
                </label>
                <Input
                  id="number"
                  aria-invalid={!!errors.number}
                  {...register('number')}
                />
                {errors.number && (
                  <p className="text-sm text-destructive">
                    {errors.number.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-1">
                <label htmlFor="complement" className="text-sm font-medium">
                  Complemento
                </label>
                <Input id="complement" {...register('complement')} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="neighborhood" className="text-sm font-medium">
                  Bairro
                </label>
                <Input
                  id="neighborhood"
                  aria-invalid={!!errors.neighborhood}
                  {...register('neighborhood')}
                />
                {errors.neighborhood && (
                  <p className="text-sm text-destructive">
                    {errors.neighborhood.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">
                  Cidade
                </label>
                <Input
                  id="city"
                  aria-invalid={!!errors.city}
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium">
                  UF
                </label>
                <Input
                  id="state"
                  maxLength={2}
                  aria-invalid={!!errors.state}
                  {...register('state')}
                />
                {errors.state && (
                  <p className="text-sm text-destructive">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-sm font-medium">
                  CEP
                </label>
                <Input
                  id="zipCode"
                  placeholder="Somente números"
                  aria-invalid={!!errors.zipCode}
                  {...register('zipCode')}
                />
                {errors.zipCode && (
                  <p className="text-sm text-destructive">
                    {errors.zipCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Telefone
                </label>
                <Input
                  id="phone"
                  aria-invalid={!!errors.phone}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {errors.root && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.root.message}
              </p>
            )}

            {saveMutation.isSuccess && !isDirty && (
              <p className="text-sm text-emerald-600">
                Parâmetros salvos com sucesso.
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || saveMutation.isPending}>
                Salvar parâmetros
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
