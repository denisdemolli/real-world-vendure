import {
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    dummyPaymentHandler,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import path from 'path';

import fs from 'fs';
import { ReviewsPlugin } from './plugins/reviews/reviews-plugin';
import { customAdminUi } from './compile-admin-ui';

const IS_PROD = path.basename(__dirname) === 'dist';

export const config: VendureConfig = {
    apiOptions: {
        port: 3000,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        adminApiPlayground: {
            settings: { 'request.credentials': 'include' },
        },
        adminApiDebug: true,
        shopApiPlayground: {
            settings: { 'request.credentials': 'include' },
        },
        shopApiDebug: true,
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        cookieOptions: {
            secret: 'jysakgzhw6',
        },
    },
    dbConnectionOptions: {
        type: 'mysql',
    	synchronize: false,
	logging: false,
    	port: 25060,
    	database: 'defaultdb',
    	host: 'db-mysql-fra1-09543-do-user-9960092-0.b.db.ondigitalocean.com',
    	username: 'doadmin',
    	password: '',
 	ssl: {
         rejectUnauthorized : false,
  	},
        migrations: [getMigrationsPath()],
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    customFields: {},
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
	    assetUrlPrefix: 'https://fitdesk.sk/assets/',
        }),
        DefaultSearchPlugin,
        DefaultJobQueuePlugin,
	EmailPlugin.init({
            route: 'mailbox',
            // devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, '../static/email/templates'),
            globalTemplateVars: {
                // The following variables will change depending on your storefront implementation
                fromAddress: 'info@fitdesk.sk',
                verifyEmailAddressUrl: 'https://shop.fitdesk.sk/account/verify',
                passwordResetUrl: 'https://shop.fitdesk.sk/account/password-reset',
                changeEmailAddressUrl: 'https://shop.fitdesk.sk/account/verify-email-address-change',
            },
            transport: {
                type: 'smtp',
                host: 'smtp.eu.mailgun.org',
                port: 25,
                auth: {
                  user: 'postmaster@fitdesk.sk',
                  pass: '---',
                 },
                logging: true,
                debug: true,
                secure: false,
                transactionLog: true,
            },
        }),

        AdminUiPlugin.init({
            route: 'admin',
            port: 3002,
            app: customAdminUi({ recompile: !IS_PROD, devMode: !IS_PROD }),
        }),
        ReviewsPlugin,
    ],
};

function getMigrationsPath() {
    const devMigrationsPath = path.join(__dirname, '../migrations');
    const distMigrationsPath = path.join(__dirname, 'migrations');

    return fs.existsSync(distMigrationsPath)
        ? path.join(distMigrationsPath, '*.js')
        : path.join(devMigrationsPath, '*.ts');
}
