import { Service } from 'typedi';

import { Repository } from '@/core';

import Example, { IExample } from './example.model';

@Service()
export class ExampleRepository extends Repository<IExample> {
  constructor() {
    super(Example);
  }
}
