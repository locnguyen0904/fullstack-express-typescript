import 'reflect-metadata';
import { Service } from 'typedi';
import Example, { IExample } from './example.model';
import BaseService from '@/core/service.core';

@Service()
class ExampleService extends BaseService<IExample> {
  constructor() {
    super(Example);
  }
}

export default ExampleService;
