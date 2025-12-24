import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logActivity } from '../utils/auditLogger';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const { title, description, imageUrl, location, date, category, active } = req.body;
  const user = (req as any).dbUser;

  try {
    const project = await prisma.project.create({
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

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: 'CREATE',
      entity: 'PROJECT',
      entityId: project.id,
      details: `Proyecto creado: ${title}`,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Error al crear el proyecto' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, imageUrl, location, date, category, active } = req.body;
  const user = (req as any).dbUser;

  try {
    const project = await prisma.project.update({
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

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: 'UPDATE',
      entity: 'PROJECT',
      entityId: project.id,
      details: `Proyecto actualizado: ${title}`,
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).dbUser;

  try {
    const project = await prisma.project.delete({
      where: { id },
    });

    await logActivity({
      userId: user.id,
      userName: user.name,
      action: 'DELETE',
      entity: 'PROJECT',
      entityId: id,
      details: `Proyecto eliminado: ${project.title}`,
    });

    res.json({ message: 'Proyecto eliminado con éxito' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
};
