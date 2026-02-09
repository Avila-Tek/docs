const stacks = [
    {
        name: 'Turborepo',
        image: '/img/turborepo.svg',
        url: 'https://turborepo.org/',
        description: 'Monorepo para gestionar múltiples aplicaciones y paquetes.',
    },
    {
        name: 'Fastify',
        image: '/img/fastify.svg',
        url: 'https://fastify.dev/',
        description: 'Framework web para Node.js, rápido y de bajo overhead.',
    },
    {
        name: 'MongoDB',
        image: '/img/mongodb.svg',
        url: 'https://www.mongodb.com/',
        description: 'Base de datos NoSQL orientada a documentos.',
    },
    {
        name: 'Next.js',
        image: '/img/next-js.svg',
        url: 'https://nextjs.org/',
        description: 'Framework base para routing, rendering y optimizaciones (SSR / RSC cuando aplique).',
    },
    {
        name: 'React',
        image: '/img/react.svg',
        url: 'https://react.dev/',
        description: 'UI basada en componentes, composición y estado explícito.',
    },
    {
        name: 'TypeScript',
        image: '/img/typescript.svg',
        url: 'https://www.typescriptlang.org/',
        description: 'Tipado estricto como primera línea de defensa contra errores.',
    },
    {
        name: 'React Hook Form',
        image: '/img/react-hook-form.svg',
        url: 'https://react-hook-form.com/',
        description: 'Manejo de formularios de forma performante y declarativa.',
    },
    {
        name: 'React Query',
        image: '/img/react-query.svg',
        url: 'https://tanstack.com/query/latest',
        description: 'Capa de acceso a datos remotos (queries, mutations, cache, retries).',
    },
    {
        name: 'shadcn/ui',
        image: '/img/shadcnui.svg',
        url: 'https://ui.shadcn.com/',
        description: 'Librería de componentes base, accesibles y extensibles, integrada con Tailwind.',
    },
    {
        name: 'Sentry',
        image: '/img/sentry.svg',
        url: 'https://sentry.io/',
        description: 'Plataforma de monitoreo de errores y rendimiento.',
    },
];

export function StackResourcesImages() {
    const imageWidth = 50;

    return (
        <div style={{ margin: '3rem 0' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
                {stacks.map((item, index) => (
                    <a title={item.name} key={item.name} href={item.url} target="_blank" rel="noopener noreferrer">
                        <img width={imageWidth} src={item.image} alt={item.name} />
                    </a>
                ))}
            </div>
        </div>
    );
}

export function StackResourcesList() {
    return (
        <>
            <p>Usamos un stack <strong>moderno, opinionado y probado en producción</strong>:</p>
            <ul>
                {stacks.map((item, index) => (
                    <li key={index} >
                        <strong >{item.name}</strong>
                        <p>{item.description}</p>
                    </li>
                ))}
            </ul>
        </>
    );
}
