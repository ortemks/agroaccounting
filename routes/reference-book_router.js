const express = require('express');
const router = express.Router();

const URL = '/reference-book';


const termRoutes = require('./reference-book/reference-book_routes/term_routes');

const consumptionRoutes = require('./reference-book/reference-book_routes/term-types_routes/consumption-type')
const fieldNumbersRoutes = require('./reference-book/reference-book_routes/term-types_routes/field-number');
const firmsRoutes = require('./reference-book/reference-book_routes/term-types_routes/firm');
const InventoryItemsRoutes = require('./reference-book/reference-book_routes/term-types_routes/inventory-item');
const measurmentsRoutes = require('./reference-book/reference-book_routes/term-types_routes/measurement');
const mechanismInnerNumbersRoutes = require('./reference-book/reference-book_routes/term-types_routes/mechanism_inner-number');
const mechanismsRoutes = require('./reference-book/reference-book_routes/term-types_routes/mechanism');
const outfitsRoutes = require('./reference-book/reference-book_routes/term-types_routes/outfit');
const providersRoutes = require('./reference-book/reference-book_routes/term-types_routes/provider');
const workTypesRoutes = require('./reference-book/reference-book_routes/term-types_routes/work-type');
const workersRoutes = require('./reference-book/reference-book_routes/term-types_routes/worker');
const workingPostsRoutes = require('./reference-book/reference-book_routes/term-types_routes/working-post');


router.use(URL, termRoutes, consumptionRoutes, fieldNumbersRoutes, firmsRoutes, InventoryItemsRoutes, measurmentsRoutes, mechanismInnerNumbersRoutes, mechanismsRoutes, mechanismsRoutes, outfitsRoutes, providersRoutes, workTypesRoutes, workersRoutes, workingPostsRoutes);

module.exports = router;