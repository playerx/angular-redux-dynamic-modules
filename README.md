# Dynamic modules configuration for Angular Redux

Works with async modules too.

## How to use:

App module:

```ts
import { StoreModule } from 'angular-redux-dynamic-modules';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		...
		StoreModule,
		...
		UserModule,
		HRModule,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }

```



User Module (for example):

```ts
import { StoreConfigService } from 'angular-redux-dynamic-modules';


@NgModule({
	imports: [
		CommonModule,
	],
	providers: [Actions, UserService, Epics],
})
export class UserModule {
	constructor(
		storeConfig: StoreConfigService,
		epics: Epics
	) {

		// Register State
		storeConfig.addModule(
			'User',
			InitialState,
			reducer,
			[epics]
		);

	}

}
```


Dispatching Actions:

```ts
import { Dispatcher } from 'angular-redux-dynamic-modules';
import * as user from '@modules/user';
import * as hr from '@modules/hr';

export class MainComponent implements OnInit {

	constructor(
		private store: Dispatcher<hr.PublicAction | user.PublicAction>
	) { }
	
	ngOnInit() {
		this.store.dispatch({
			type: hr.ActionType.LoadList,
			filterName: '',
			filterSurname: ''
		});
	}

}
```


Also please check out: 
[Example App](https://github.com/playerx/angular-redux)
