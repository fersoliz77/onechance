import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — One Chance',
  description: 'Política de privacidad y tratamiento de datos de la plataforma One Chance.',
}

const SECTIONS = [
  {
    title: '1. Información que recopilamos',
    body: 'Recopilamos información que nos proporcionás al registrarte: nombre, email, fecha de nacimiento, nacionalidad y datos de perfil deportivo (posición, trayectoria, etc.). También recopilamos automáticamente datos de uso como páginas visitadas y acciones dentro de la plataforma.',
  },
  {
    title: '2. Cómo usamos tu información',
    body: 'Usamos tus datos para: crear y gestionar tu perfil, facilitar el contacto entre usuarios de la plataforma, mejorar la experiencia de la aplicación, enviar notificaciones relacionadas con tu cuenta, y cumplir con obligaciones legales.',
  },
  {
    title: '3. Visibilidad de tu perfil',
    body: 'Tu perfil solo es visible públicamente cuando está en estado "Publicado". Los perfiles en estado borrador, pendiente, rechazado u oculto solo son accesibles por vos y por el equipo de administración de One Chance.',
  },
  {
    title: '4. Compartir información con terceros',
    body: 'No vendemos ni cedemos tus datos personales a terceros. Podemos compartir información anónima y agregada (sin identificación personal) con fines estadísticos. Usamos Firebase (Google) como proveedor de infraestructura, sujeto a sus propias políticas de privacidad.',
  },
  {
    title: '5. Menores de edad',
    body: 'Los perfiles de usuarios menores de 18 años requieren revisión y aprobación explícita del equipo de One Chance antes de ser publicados. Aplicamos medidas adicionales de protección para la privacidad de usuarios menores.',
  },
  {
    title: '6. Seguridad de los datos',
    body: 'Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado, pérdida o alteración. Las contraseñas se almacenan de forma encriptada y nunca en texto plano.',
  },
  {
    title: '7. Tus derechos',
    body: 'Tenés derecho a acceder, corregir o eliminar tus datos personales en cualquier momento desde tu panel de usuario. También podés solicitar la eliminación completa de tu cuenta escribiendo a contacto@onechance.app.',
  },
  {
    title: '8. Cookies',
    body: 'Usamos cookies esenciales para mantener tu sesión activa y garantizar el funcionamiento correcto de la plataforma. No usamos cookies de seguimiento publicitario de terceros.',
  },
  {
    title: '9. Cambios en esta política',
    body: 'Podemos actualizar esta política en cualquier momento. Te notificaremos cambios significativos por email o mediante un aviso en la plataforma.',
  },
  {
    title: '10. Contacto',
    body: 'Para ejercer tus derechos o consultar sobre el tratamiento de tus datos podés escribirnos a contacto@onechance.app.',
  },
]

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-[var(--oc-bg-base)] text-white">
      <div className="oc-shell py-20 max-w-[760px]">
        <Link href="/" className="mb-8 inline-block text-[13px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">← Volver al inicio</Link>

        <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[var(--oc-lime)]">Plataforma One Chance</div>
        <h1 className="text-[38px] font-[800] tracking-[-0.03em] text-white mb-2">Política de Privacidad</h1>
        <p className="text-[14px] text-[rgba(255,255,255,0.35)] mb-12">Última actualización: Mayo 2026</p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-[17px] font-[700] text-white mb-3">{s.title}</h2>
              <p className="text-[14px] leading-[1.8] text-[rgba(255,255,255,0.55)]">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-[var(--oc-border)] pt-8 text-[13px] text-[rgba(255,255,255,0.3)]">
          <p>© 2026 One Chance. Todos los derechos reservados.</p>
          <div className="mt-3 flex gap-4">
            <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <a href="mailto:contacto@onechance.app" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </div>
    </main>
  )
}
