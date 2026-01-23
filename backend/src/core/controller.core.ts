import 'reflect-metadata';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Document } from 'mongoose';

import Service from './service.core';
import { NotFoundError } from './response-error.core';
import { CREATED, LIST, OK } from '@/core/response-success.core';

class Controller<T extends Document, S extends Service<T>> {
  protected service: S;
  protected _name: string;

  constructor(service: S) {
    this._name = this.constructor.name.replace('Controller', '');
    this.service = service;
  }

  async create(req: Request, res: Response): Promise<void> {
    const data = req.body as Partial<T>;
    const result = await this.service.create(data);
    new CREATED({ data: result }).send(res);
  }

  async update(req: Request, res: Response): Promise<void> {
    const result = await this.service.update(
      req.params.id,
      req.body as Partial<T>
    );
    if (!result) {
      throw new NotFoundError(
        `${this._name} does not found with id ${req.params.id}`
      );
    }
    new OK({ data: result }).send(res);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const result = await this.service.softDelete(req.params.id);
    if (!result) {
      throw new NotFoundError(
        `${this._name} does not found with id ${req.params.id}`
      );
    }
    new OK({ data: result }).send(res);
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const { docs, totalDocs, page, totalPages, limit } =
      await this.service.findAll(req.query as Record<string, unknown>);
    new LIST({
      data: docs,
      total: totalDocs,
      page: page,
      pages: totalPages,
      limit: limit,
    }).send(res);
  }

  async findOne(req: Request, res: Response): Promise<void> {
    const result = await this.service.findById(req.params.id);
    if (!result) {
      throw new NotFoundError(
        `${this._name} does not found with id ${req.params.id}`
      );
    }
    new OK({ data: result }).send(res);
  }

  static handler(
    method: (req: Request, res: Response) => Promise<void>
  ): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        return await method(req, res);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default Controller;
