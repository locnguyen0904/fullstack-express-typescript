import 'reflect-metadata';

import { Service } from 'typedi';

import { Controller } from '@/core';

import { IExample } from './example.model';
import ExampleService from './example.service';

@Service()
class ExampleController extends Controller<IExample, ExampleService> {
  constructor(service: ExampleService) {
    super(service);
  }
}

export default ExampleController;
