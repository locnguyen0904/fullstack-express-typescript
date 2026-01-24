import 'reflect-metadata';
import { Service } from 'typedi';
import ExampleService from './example.service';
import { IExample } from './example.model';
import { Controller } from '@/core';

@Service()
class ExampleController extends Controller<IExample, ExampleService> {
  constructor(service: ExampleService) {
    super(service);
  }
}

export default ExampleController;
