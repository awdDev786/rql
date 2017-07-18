import { ApolloQueryResult } from 'apollo-client';

import ApolloClient from 'apollo-client';
import * as angular from 'angular';

class Apollo {
  constructor(
    private client: ApolloClient, 
    private $q: any
  ) {}

  public query<T>(options: any): angular.IPromise<ApolloQueryResult<T>> {
    this.check();
    
    return this.wrap(this.client.query<T>(options));
  } 

  public mutate<T>(options: any): angular.IPromise<ApolloQueryResult<T>> {
    this.check();
    
    return this.wrap(this.client.mutate<T>(options));
  }

  private check(): void {
    if (!this.client) {
      throw new Error('Client is missing. Use ApolloProvider.defaultClient');
    }
  }

  private wrap<R>(promise: Promise<R>): angular.IPromise<R> {
    return this.$q((resolve, reject) => {
      promise.then(resolve).catch(reject);
    });
  }
}

class ApolloProvider implements angular.IServiceProvider {
  private client: ApolloClient;
  
  public $get = ['$q', ($q) => new Apollo(this.client, $q)];
  
  public defaultClient(client: ApolloClient) {
    this.client = client;
  }
}

export default angular.module('angular-apollo', [])
  .provider('apollo', new ApolloProvider);