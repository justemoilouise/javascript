import { getAllOfEntity } from "../selectors/entities/factories";
import _flatMap from "lodash/flatMap";
import _uniq from "lodash/uniq";

/** Product helpers */

export const SITE_TYPE_PLUGIN_SLUG_MAPPING = {
	wordpress: "all-plugins",
	typo3: "all-typo3-extensions",
};

/**
 * Returns the product group that have the passed slug's productGroup as a parent.
 *
 * @param   {string}  slug          	The slug of the parent productGroup.
 * @param   {Array}   productGroups 	All productGroups.
 * @param   {boolean} includeParent 	Whether or not to include the parent itself.
 * @returns {Array}   The productGroups that belong to the parent slug.
 */
export function getProductGroupsByParentSlug( slug, productGroups, includeParent = false ) {
	// Get the id of the parent productGroup.
	const parentGroup = productGroups.find( productGroup => productGroup.slug === slug );
	if ( parentGroup ) {
		const children = productGroups.filter( productGroup => productGroup.parentId === parentGroup.id );

		if ( includeParent ) {
			return [ parentGroup, ...children ];
		}
		return children;
	}
	return [];
}

/**
 * Lifting information about the product and subscriptions to the productGroup.
 *
 * @param   {Object} productGroup        The productGroup to be updated.
 * @param   {Array}  activeSubscriptions The active subscriptions, in an array.
 * @returns {Object}                     A productGroup updated with product and subscription info.
 */
export function addSubscriptionInfoToProductGroup( productGroup, activeSubscriptions ) {
	// Set defaults
	productGroup.limit = 0;
	productGroup.isEnabled = false;
	productGroup.used = 0;
	productGroup.subscriptionId = "";
	productGroup.currency = "USD";

	// Override productGroup name and icon in case of the all plugins subscription. The icon hardcode is a temporary fix!
	if ( productGroup.slug === "all-plugins" ) {
		productGroup.name = "Plugin subscription";
		productGroup.icon = "https://yoast.com/app/uploads/2018/11/Plugin_subscription.png";
	}

	// Lift a couple of things from the US product variation to the product group.
	// This should be a temporary situation: productGroup properties need to be expanded.
	const usProduct = productGroup.products.filter( ( product ) => {
		return product.sourceShopId === 1;
	} );
	productGroup.storeUrl = usProduct[ 0 ] && usProduct[ 0 ].storeUrl;
	productGroup.icon = productGroup.icon || ( usProduct[ 0 ] ? usProduct[ 0 ].icon : "" );

	// This is needed for the sortByPopularity function.
	productGroup.glNumber = usProduct[ 0 ] && usProduct[ 0 ].glNumber;

	// Get ids of all products in this product group.
	const productIds = productGroup.products.map( ( product ) => {
		return product.id;
	} );

	// Get all subscriptions for products in this product group.
	activeSubscriptions
		.filter( ( subscription ) => {
			return productIds.includes( subscription.productId );
		} )
		.forEach( ( subscription ) => {
			// Accumulate amount of slots for this productGroup.
			productGroup.limit += subscription.limit;
			// Accumulate amount of slots in use for this productGroup.
			productGroup.used += ( subscription.used || 0 );

			/*
			 * If the productGroup subscription is enabled for this site, make sure it's
			 * subscriptionId is set on the productGroup.
			 */
			if ( subscription.isEnabled === true ) {
				productGroup.isEnabled = true;
				productGroup.subscriptionId = subscription.id;
				/*
				 * If the productGroup subscription Id has not been set and there are still slots
				 * available, set the first available product subscription for this productGroup.
				 */
			} else if (
				productGroup.subscriptionId === "" &&
				( subscription.limit > ( subscription.used || 0 ) )
			) {
				productGroup.subscriptionId = subscription.id;
			}

			// Determine currency based on the subscription currency.
			// Eventually the currency should be made available on the products themselves.
			// This needs to be fixed in the shop.
			productGroup.currency = subscription.currency;
			productGroup.storeUrl = subscription.product.storeUrl || productGroup.storeUrl;
		} );

	productGroup.hasSubscriptions = productGroup.limit > 0;
	productGroup.isAvailable = productGroup.limit > productGroup.used || productGroup.isEnabled;

	return productGroup;
}

/**
 * Get all products that are in a productGroup.
 *
 * @param   {string}  pluginGroupId The id of the pluginGroup we want to find the products for.
 * @param   {Array}   allProducts   All products.
 * @returns {Array}                 The products that are in the productGroup.
 */
export function getProductsByProductGroupId( pluginGroupId, allProducts ) {
	return allProducts
		.filter( ( product ) => {
			const productGroupIds = product.productGroups.map( productGroup => productGroup.id );
			return productGroupIds.includes( pluginGroupId );
		} );
}

/**
 * Get all products that are in a set of productGroups.
 *
 * @param   {Array}   pluginGroupIds The ids of the pluginGroups we want to find the products for.
 * @param   {Array}   allProducts    All products.
 * @returns {Array}                  The products that are in the productGroups.
 */
export function getProductsByProductGroupIds( pluginGroupIds, allProducts ) {
	return _uniq(
		_flatMap( pluginGroupIds, pluginGroupId => getProductsByProductGroupId( pluginGroupId, allProducts ) )
	);
}

/**
 * Gets the products that a subscription gives access to.
 *
 * @param   {Object} state        The application state.
 * @param   {Object} subscription The subscription.
 *
 * @returns {Array}               An array with the products for the subscription.
 */
export function getProductsFromSubscription( state, subscription ) {
	if ( ! subscription.product.productGroups ) {
		/*
		If this product has no productGroups attached to it, we can not find potential other products via the productGroups.
		Best guess is to at least return the product inside an array to be in line with expected behaviour for this function.
		If the subscription does not even have a product, return an empty array.
		 */
		return subscription.product ? [ subscription.product ] : [];
	}

	let productGroups = subscription.product.productGroups;
	const allProducts = getAllOfEntity( state, "products" );

	// If at least one productGroup doesn't have a parent.
	if ( productGroups.some( productGroup => productGroup.parentId === null ) ) {
		const allProductGroups = getAllOfEntity( state, "productGroups" );

		// Retrieve the child product groups for the parent product group.
		productGroups = _flatMap( productGroups, ( productGroup ) => {
			return getProductGroupsByParentSlug( productGroup.slug, allProductGroups );
		} );
	}
	// Return the products for the product groups.
	return _flatMap(
		productGroups,
		productGroup => getProductsByProductGroupId( productGroup.id, allProducts )
	);
}

/**
 * Returns true if a product has downloads.
 *
 * @param   {Object}  product The product to check downloads for.
 * @returns {boolean}         Whether or not the product has downloads.
 */
export const hasDownload = ( product ) => {
	return product.hasOwnProperty( "downloads" ) && product.downloads.length > 0;
};