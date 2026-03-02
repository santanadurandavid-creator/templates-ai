import type { Template, KnowledgeProcess } from './types';

const quickTemplateColors = [
  '#4A779D', // Default Blue
  '#4A779D', 
  '#4A779D', 
  '#4A779D', 
  '#4A779D', 
  '#4A779D',
];

export const DEFAULT_TEMPLATES: Omit<Template, 'id'>[] = [
  {
    title: 'Saludo Inicial',
    content: '¡Hola! Gracias por contactar a nuestro equipo de soporte. Mi nombre es [TU NOMBRE], ¿en qué puedo ayudarte hoy?',
    category: 'Quick',
    tags: ['saludo', 'inicio', 'bienvenida'],
    usageCount: 0,
    isQuick: true,
    createdAt: new Date().toISOString(),
    color: quickTemplateColors[0],
  },
  {
    title: 'Despedida',
    content: 'Gracias por tu tiempo. Si no hay nada más en lo que pueda ayudarte, te deseo un excelente día. ¡Hasta luego!',
    category: 'Quick',
    tags: ['despedida', 'cierre', 'final'],
    usageCount: 0,
    isQuick: true,
    createdAt: new Date().toISOString(),
    color: quickTemplateColors[1],
  },
  {
    title: 'Agradecimiento',
    content: 'Muchas gracias por tu paciencia y colaboración. Aprecio mucho tu ayuda para resolver esto.',
    category: 'Quick',
    tags: ['agradecimiento', 'paciencia'],
    usageCount: 0,
    isQuick: true,
    createdAt: new Date().toISOString(),
    color: quickTemplateColors[2],
  },
    {
    title: 'Espera un momento',
    content: 'Por favor, permíteme un momento mientras reviso la información. Te agradezco tu espera.',
    category: 'Quick',
    tags: ['espera', 'revisión'],
    usageCount: 0,
    isQuick: true,
    createdAt: new Date().toISOString(),
    color: quickTemplateColors[3],
  },
  {
    title: 'Confirmación de Solución',
    content: 'Me alegra confirmar que el problema ha sido resuelto. ¿Hay algo más en lo que pueda asistirte?',
    category: 'Quick',
    tags: ['solución', 'confirmación'],
    usageCount: 0,
    isQuick: true,
    createdAt: new Date().toISOString(),
    color: quickTemplateColors[4],
  },
  {
    title: 'Transferencia de Caso',
    content: 'Para poder ayudarte mejor, voy a transferir tu caso a un especialista en el área. Él/ella se pondrá en contacto contigo a la brevedad.',
    category: 'Quick',
    tags: ['transferencia', 'especialista'],
    usageCount: 0,
    isQuick: true,
    createdAt: new Date().toISOString(),
    color: quickTemplateColors[5],
  },
  {
    title: 'Explicación de Facturación',
    content: 'Entiendo tu consulta sobre la facturación. Permíteme detallarte los cargos. El cargo de [CANTIDAD] corresponde a [PRODUCTO/SERVICIO] del período [FECHA].',
    category: 'Finanzas',
    tags: ['facturación', 'cobros', 'finanzas'],
    usageCount: 0,
    isQuick: false,
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Respuesta a Queja de Cliente',
    content: 'Lamento sinceramente la mala experiencia que has tenido. Queremos asegurarte que tomamos tus comentarios muy en serio y ya estamos investigando lo sucedido para que no vuelva a ocurrir.',
    category: 'Empatía',
    tags: ['queja', 'disculpa', 'empatía'],
    usageCount: 0,
    isQuick: false,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_KNOWLEDGE_PROCESSES: Omit<KnowledgeProcess, 'id'>[] = [
    {
        title: "Proceso de Devolución de Producto",
        description: "1. Verificar la fecha de compra (debe ser menor a 30 días).\n2. Asegurarse de que el producto esté en su empaque original.\n3. Generar una etiqueta de devolución desde el sistema CRM.\n4. Informar al cliente sobre los plazos del reembolso.",
        tag: "Devoluciones"
    },
    {
        title: "Escalamiento de Caso Urgente",
        description: "1. Identificar si el caso cumple con los criterios de urgencia (ej. impacto financiero, riesgo de seguridad).\n2. Recopilar toda la información relevante.\n3. Usar la plantilla 'Escalamiento Urgente' y enviarla al equipo de Nivel 2.\n4. Notificar al cliente que su caso ha sido escalado.",
        tag: "Escalamientos"
    },
    {
        title: "Manejo de Cliente Enojado",
        description: "1. Usar una plantilla de empatía.\n2. Escuchar activamente sin interrumpir.\n3. Validar sus sentimientos ('Entiendo su frustración...').\n4. No prometer soluciones que no se pueden cumplir.\n5. Ofrecer una solución concreta y un seguimiento.",
        tag: "Empatía"
    }
];
