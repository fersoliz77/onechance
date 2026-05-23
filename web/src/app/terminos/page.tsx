import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — One Chance',
  description: 'Términos y condiciones de uso de la plataforma One Chance.',
}

const SECTIONS = [
  {
    title: '1. Aceptación de los términos',
    body: 'Al registrarte y utilizar One Chance aceptás estos términos en su totalidad. Si no estás de acuerdo con alguno de estos términos, no debés usar la plataforma.',
  },
  {
    title: '2. Descripción del servicio',
    body: 'One Chance es una plataforma de scouting futbolístico que permite a jugadores, técnicos, clubes y representantes crear perfiles profesionales y conectarse entre sí. La plataforma opera principalmente en América Latina.',
  },
  {
    title: '3. Registro y cuentas',
    body: 'Para usar One Chance debés crear una cuenta con información verídica. Sos responsable de mantener la confidencialidad de tus credenciales. Los usuarios menores de 18 años requieren aprobación adicional por parte del equipo de One Chance.',
  },
  {
    title: '4. Contenido del usuario',
    body: 'Al subir contenido a One Chance (fotos, videos, información de perfil) garantizás que tenés los derechos sobre dicho contenido y que no viola derechos de terceros. One Chance se reserva el derecho de eliminar contenido que viole estas condiciones.',
  },
  {
    title: '5. Uso aceptable',
    body: 'Queda prohibido usar la plataforma para actividades ilegales, enviar spam, suplantar identidades, publicar contenido falso o engañoso, o intentar acceder de manera no autorizada a sistemas o cuentas de otros usuarios.',
  },
  {
    title: '6. Moderación de perfiles',
    body: 'One Chance se reserva el derecho de aprobar, rechazar u ocultar perfiles que no cumplan con nuestros estándares de calidad y veracidad. Los perfiles requieren revisión antes de ser visibles públicamente.',
  },
  {
    title: '7. Privacidad',
    body: 'El uso de tus datos personales está regulado por nuestra Política de Privacidad. Al usar One Chance aceptás las prácticas de datos descritas en dicho documento.',
  },
  {
    title: '8. Limitación de responsabilidad',
    body: 'One Chance actúa como intermediario entre partes y no garantiza resultados específicos (contrataciones, transferencias, etc.). No somos responsables por acuerdos realizados fuera de la plataforma entre usuarios.',
  },
  {
    title: '9. Modificaciones',
    body: 'Podemos modificar estos términos en cualquier momento. Las modificaciones entran en vigencia al publicarse. El uso continuado de la plataforma implica la aceptación de los nuevos términos.',
  },
  {
    title: '10. Contacto',
    body: 'Para consultas sobre estos términos podés escribirnos a contacto@onechance.app.',
  },
]

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-[var(--oc-bg-base)] text-white">
      <div className="oc-shell py-20 max-w-[760px]">
        <Link href="/" className="mb-8 inline-block text-[13px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">← Volver al inicio</Link>

        <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[var(--oc-lime)]">Plataforma One Chance</div>
        <h1 className="text-[38px] font-[800] tracking-[-0.03em] text-white mb-2">Términos y Condiciones</h1>
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
            <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <a href="mailto:contacto@onechance.app" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </div>
    </main>
  )
}
