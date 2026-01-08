import 'reflect-metadata';
import { Router } from 'express';
import { celebrate } from 'celebrate';
import { Container } from 'typedi';
import { createExampleSchema, updateExampleSchema } from './example.validation';
import ExampleController from './example.controller';
import Controller from '@/core/controller.core';

const router: Router = Router();
const controller = Container.get(ExampleController);

router.get('/', Controller.handler(controller.findAll.bind(controller)));
router.get('/:id', Controller.handler(controller.findOne.bind(controller)));
router.post(
  '/',
  celebrate({ body: createExampleSchema }),
  Controller.handler(controller.create.bind(controller))
);
router.put(
  '/:id',
  celebrate({ body: updateExampleSchema }),
  Controller.handler(controller.update.bind(controller))
);
router.delete('/:id', Controller.handler(controller.delete.bind(controller)));

export default router;
