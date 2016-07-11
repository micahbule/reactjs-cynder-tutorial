var initialState = {
	isLoading: false,
	products: []
};

var Provider = window.ReactRedux.Provider;

var apiCall = (url, method, data = {}) => {
	return (dispatch) => {
		dispatch({ type: 'TOGGLE_API_CALL' });

		return $.ajax('http://localhost:3000/api/' + url, {
			method: method,
			data: data
		}).then((data) => {
			setTimeout(() => {
				dispatch({ type: 'LOAD_PRODUCTS', products: data });
				dispatch({ type: 'TOGGLE_API_CALL' });
			}, 3000);
		}, (jqXHR, textStatus, errorThrown) => {
			console.log(errorThrown);
			dispatch({ type: 'TOGGLE_API_CALL' });
		});
	}
};

var rootState = (state = initialState, action) => {
	switch (action.type) {
		case 'TOGGLE_API_CALL': {
			return Object.assign({}, state, { isLoading: state.isLoading ? false : true });
		}
		case 'LOAD_PRODUCTS': {
			return Object.assign({}, state, { products: action.products.map((product) => { return Object.assign(product, { isEditing: false }) }) });
		}
		case 'TOGGLE_EDIT': {
			return Object.assign({}, state, { products: state.products.map((product) => {
				if (product.id !== action.id) return product;

				return Object.assign({}, product, { isEditing: product.isEditing ? false : true });
			}) });
		}
		// case 'ADD_PRODUCT': {
		// 	return Object.assign({}, state, { products: [
		// 		...state.products,
		// 		action.product
		// 	] });
		// }
		// case 'UPDATE_PRODUCT': {
		// 	return Object.assign({}, state, { products: state.products.map((product) => {
		// 		if (product.id !== action.id) return product;

		// 		return Object.assign({}, product, action.product, { isEditing: false });
		// 	}) });
		// }
		// case 'REMOVE_PRODUCT': {
		// 	return Object.assign({}, state, { products: state.products.filter((product) => {
		// 		return product.id !== action.id;
		// 	}) });
		// }
		default: return state;
	}
};

var store = window.Redux.createStore(rootState, window.Redux.applyMiddleware(window.ReduxThunk.default));

var ProductView = ({ id, name, price, isEditing, toggleEdit, update, remove }) => {
	let updatedName;
	let updatedPrice;

	var _updateProduct = () => {
		
		if (!updatedName.value || !updatedPrice.value) {
			updatedName.value = name;
			updatedPrice.value = price;
		}

		update(id, { name: updatedName.value.trim(), price: updatedPrice.value.trim() });
	}

	return (
		<tr>
			<td>{ isEditing ? <input type="text" ref={ (node) => updatedName = node } defaultValue={ name } /> : name }</td>
			<td>{ isEditing ? <input type="text" ref={ (node) => updatedPrice = node } defaultValue={ price } /> : price }</td>
			<td><button type="button" onClick={ !isEditing ? toggleEdit : _updateProduct }>{ isEditing ? 'Save' : 'Edit' }</button></td>
			<td><button type="button" onClick={ isEditing ? toggleEdit : remove }>{ isEditing ? 'Cancel' : 'Delete' }</button></td>
		</tr>
	);
};

var ProductList = ({ products, toggleEdit, update, remove }) => (
	<table className="productList">
		<thead>
			<tr>
				<td>Name</td>
				<td>Price</td>
			</tr>
		</thead>
		<tbody>
			{ products.map((product) => {
				return <ProductView key={ product.id } { ...product } toggleEdit={ () => toggleEdit(product.id) } update={ update } remove={ () => remove(product.id) } />;
			}) }
		</tbody>
	</table>
);

var productListMapStateToProps = (state) => {
	return { products: state.products };
};

var productListMapDispatchToProps = (dispatch) => {
	return {
		toggleEdit (id) { return dispatch({ type: 'TOGGLE_EDIT', id: id }); },
		update (id, product) { return dispatch(apiCall('products/' + id, 'PUT', product)).then(() => {
			alert('Successfully updated!');
		}); },
		remove (id) { return dispatch(apiCall('products/' + id, 'DELETE')).then(() => {
			alert('Successfully removed!');
		}); }
	}
};

var ProductListContainer = window.ReactRedux.connect(productListMapStateToProps, productListMapDispatchToProps)(ProductList);

var ProductAddForm = ({ dispatch }) => {
	let name;
	let price;

	var handleSubmit = (e) => {
		e.preventDefault();
		
		if (!name.value || !price.value) return alert('Values required!');
		dispatch(apiCall('products', 'POST', { name: name.value.trim(), price: price.value.trim() })).then(() => {
			alert('Successfully added!');
		});
		name.value = '';
		price.value = '';
	}

	return (
		<form className="productForm" onSubmit={ handleSubmit }>
			<input type="text" ref={ (node) => name = node } placeholder="Product Name" />
			<input type="text" ref={ (node) => price = node } placeholder="Product Price" />
			<input type="submit" value="Add Product" />
		</form>
	);
};

var ProductAddContainer = window.ReactRedux.connect()(ProductAddForm);

var ProductsBox = ({ isLoading }) => {
	return (
		<div className="productBox">
			<h1>Products</h1>
			{ isLoading ? <h2>loading products</h2> : null }
			<ProductListContainer />
			<ProductAddContainer />
		</div>
	);
};

var rootMapStateToProps = (state) => {
	return { isLoading: state.isLoading };
};

var ProductContainer = window.ReactRedux.connect(rootMapStateToProps)(ProductsBox);

ReactDOM.render(
	<Provider store={ store }>
		<ProductContainer />
	</Provider>,
	document.getElementById('content')
);

store.dispatch(apiCall('products', 'GET', null)).then(() => {
	console.log('Dany!', store.getState());
});