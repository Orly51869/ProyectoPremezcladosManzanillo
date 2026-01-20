"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjects = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const auditLogger_1 = require("../utils/auditLogger");
const getProjects = async (req, res) => {
    try {
        const projects = await prisma_1.default.project.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(projects);
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Error al obtener los proyectos' });
    }
};
exports.getProjects = getProjects;
const createProject = async (req, res) => {
    const { title, description, imageUrl, location, date, category, active } = req.body;
    const user = req.dbUser;
    try {
        const project = await prisma_1.default.project.create({
            data: {
                title,
                description,
                imageUrl,
                location,
                date,
                category,
                active: active ?? true,
            },
        });
        await (0, auditLogger_1.logActivity)({
            userId: user.id,
            userName: user.name,
            action: 'CREATE',
            entity: 'PROJECT',
            entityId: project.id,
            details: `Proyecto creado: ${title}`,
        });
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Error al crear el proyecto' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, imageUrl, location, date, category, active } = req.body;
    const user = req.dbUser;
    try {
        const project = await prisma_1.default.project.update({
            where: { id },
            data: {
                title,
                description,
                imageUrl,
                location,
                date,
                category,
                active,
            },
        });
        await (0, auditLogger_1.logActivity)({
            userId: user.id,
            userName: user.name,
            action: 'UPDATE',
            entity: 'PROJECT',
            entityId: project.id,
            details: `Proyecto actualizado: ${title}`,
        });
        res.json(project);
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Error al actualizar el proyecto' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    const { id } = req.params;
    const user = req.dbUser;
    try {
        const project = await prisma_1.default.project.delete({
            where: { id },
        });
        await (0, auditLogger_1.logActivity)({
            userId: user.id,
            userName: user.name,
            action: 'DELETE',
            entity: 'PROJECT',
            entityId: id,
            details: `Proyecto eliminado: ${project.title}`,
        });
        res.json({ message: 'Proyecto eliminado con éxito' });
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Error al eliminar el proyecto' });
    }
};
exports.deleteProject = deleteProject;
