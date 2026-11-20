# officeworks

A storefront where customers browse a product catalogue, search it, and send enquiries about products to the sales team.

## Catalogue

**Catalogue**:
The full set of products and categories offered in the store, sourced from an external catalogue provider.
_Avoid_: Inventory, store data

**Product**:
A single item in the catalogue that a customer can view and enquire about.
_Avoid_: Item, listing, SKU

**Category**:
A flat grouping of products; every product belongs to exactly one category.
_Avoid_: Department, collection, section

**Featured product**:
A product the merchant has hand-picked to highlight, either on the home page (at most five) or within one category. Shown to customers under the label "Top rated", but unrelated to customer ratings.
_Avoid_: Top rated product, best seller, highlighted product

**Additional products**:
The products in a category that are not featured for that category.
_Avoid_: Other products, remaining products

**Rating**:
The provider's average customer score and review count for a product; informational only.
_Avoid_: Review, stars

## Enquiries

**Enquiry**:
A customer's request to be contacted by sales about one specific product, carrying their contact details.
_Avoid_: Lead, contact request, quote

**Enquiry log**:
The CSV file every enquiry is appended to, for the sales team to follow up.
_Avoid_: Sales inbox, enquiry database
