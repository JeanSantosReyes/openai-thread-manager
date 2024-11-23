import axios from 'axios';
import inquirer from 'inquirer';

const BASE_URL = 'https://api.openai.com/v1/threads';
const proyectos = [
    { name: 'Project 1', id: 'proj_###########1' },
    { name: 'Project 2', id: 'proj_###########2' },
];

let headers = {
    'Content-Type': 'application/json',
    'Authorization': '######################',
    'OpenAI-Organization': 'org-###########',
    'OpenAI-Beta': '###########',
};

/**
 * Obtiene la lista de threads desde la API.
 */
const obtenerThreads = async () => {
    try {
        const response = await axios.get(`${BASE_URL}?limit=100`, { headers });
        return response.data.data || [];
    } catch (error) {
        console.error('Error al obtener los threads:', error.response?.data || error.message);
        return [];
    }
}

/**
 * Elimina un thread por su ID.
 */
const eliminarThread = async (threadId) => {
    try {
        const url = `${BASE_URL}/${threadId}`;
        await axios.delete(url, { headers });
        console.log(`Hilo ${threadId} eliminado exitosamente.`);
    } catch (error) {
        console.error(`Error al eliminar el hilo ${threadId}:`, error.response?.data || error.message);
    }
}

/**
 * Elimina todos los threads disponibles.
 */
const eliminarTodosLosThreads = async () => {
    try {
        const threads = await obtenerThreads();
        if (threads.length === 0) {
            console.log('No hay threads disponibles para eliminar.');
            return;
        }

        for (const thread of threads) {
            await eliminarThread(thread.id);
        }

        console.log('Todos los threads han sido eliminados.');
    } catch (error) {
        console.error('Error al eliminar todos los threads:', error.message);
    }
}

/**
 * Cambiar de proyecto.
 */
const cambiarProyecto = async () => {
    const { proyecto } = await inquirer.prompt([
        {
            type: 'list',
            name: 'proyecto',
            message: 'Selecciona un proyecto de OpenAI:',
            choices: proyectos.map(proyecto => ({
                name: proyecto.name,
                value: proyecto,
            })),
        },
    ]);

    headers['OpenAI-Project'] = proyecto.id;
    console.clear();
    console.log(`Proyecto: ${proyecto.name}`);
}

/**
 * Muestra el menú principal.
 */
const menuPrincipal = async () => {

    await cambiarProyecto();

    while (true) {
        console.log('\nGestión de Threads');
        const { accion } = await inquirer.prompt([
            {
                type: 'list',
                name: 'accion',
                message: 'Selecciona una opción:',
                choices: [
                    { name: 'Listar Threads', value: 'listar' },
                    { name: 'Eliminar Thread', value: 'eliminar' },
                    { name: 'Eliminar Todos los Threads', value: 'eliminar_todos' },
                    { name: 'Cambiar Proyecto', value: 'cambiar_proyecto' },
                    { name: 'Salir', value: 'salir' },
                ],
            },
        ]);

        switch (accion) {
            case 'listar':
                const threads = await obtenerThreads();
                if (threads.length === 0) {
                    console.log('No hay threads disponibles.');
                } else {
                    console.log('\n--- Lista de Threads ---');
                    threads.forEach((thread, index) => {
                        console.log(`${index + 1}. Thread ID: ${thread.id}`);
                    });
                }
                break;

            case 'eliminar':
                const threadsToDelete = await obtenerThreads();
                if (threadsToDelete.length === 0) {
                    console.log('No hay threads disponibles para eliminar.');
                } else {
                    const { threadId } = await inquirer.prompt([
                        {
                            type: 'list',
                            name: 'threadId',
                            message: 'Selecciona el thread a eliminar:',
                            choices: threadsToDelete.map(thread => ({
                                name: `Thread ID: ${thread.id}`,
                                value: thread.id,
                            })),
                        },
                    ]);

                    await eliminarThread(threadId);
                }
                break;

            case 'eliminar_todos':
                const { confirmar } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirmar',
                        message: '¿Estás seguro de que deseas eliminar todos los threads? Esta acción no se puede deshacer.',
                    },
                ]);

                if (confirmar) {
                    await eliminarTodosLosThreads();
                } else {
                    console.log('Operación cancelada.');
                }
                break;

            case 'cambiar_proyecto':
                await cambiarProyecto();
                break;

            case 'salir':
                console.log('Saliendo del programa...');
                return;

            default:
                console.log('Opción no válida. Intenta de nuevo.');
                break;
        }
    }
}

// Ejecutar el menú principal
menuPrincipal().catch(error => {
    console.error('Error en el programa:', error.message);
});