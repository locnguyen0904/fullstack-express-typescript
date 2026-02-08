import { singleton } from 'tsyringe';

import { Repository } from '@/core';

import Example, { IExample } from './example.model';

@singleton()
export class ExampleRepository extends Repository<IExample> {
  constructor() {
    super(Example);
  }
}
