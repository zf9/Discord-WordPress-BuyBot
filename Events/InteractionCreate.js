const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const WooCommerceAPI = require('@woocommerce/woocommerce-rest-api').default;
const Config = require('../Config/MainConfig.json');

const WooCommerce = new WooCommerceAPI({
    url: Config.WordPress_url,
    consumerKey: Config.WordPress_consumerKey,
    consumerSecret: Config.WordPress_consumerSecret,
    version: Config.WordPress_version
});

const userSelectionContext = new Map();

const createActionRow = (components) => new ActionRowBuilder().addComponents(components);

const createButtonRow = (buttons) => createActionRow(
    buttons.map(btn => new ButtonBuilder()
        .setCustomId(btn.id)
        .setLabel(btn.label)
        .setStyle(btn.style || ButtonStyle.Primary))
);

const createSelectMenu = (id, placeholder, options = []) => {
    const menu = new StringSelectMenuBuilder()
        .setCustomId(id)
        .setPlaceholder(placeholder)
        .addOptions(options);

    return createActionRow([menu]);
};

const fetchProducts = async (searchTerm) => {
    try {
        let products = [];
        let page = 1;

        const response = await WooCommerce.get('products', { per_page: 20, page, status: "publish", search: searchTerm });
        products.push(...response.data);

        return products;
    } catch (error) {
        console.error(`Error fetching products: ${error.message}`);
        throw error;
    }
};

const fetchProductVariations = async (productId) => {
    try {
        const response = await WooCommerce.get(`products/${productId}/variations`, { per_page: 100 });
        return response.data;
    } catch (error) {
        console.error(`Error fetching variations for product ${productId}: ${error.message}`);
        return [];
    }
};

const fetchProductVariation = async (productId, variationId) => {
    try {
        const response = await WooCommerce.get(`products/${productId}/variations/${variationId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching variation ${variationId} for product ${productId}: ${error.message}`);
        return null;
    }
};

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

        const productSelectionButtons = createButtonRow([
            { id: 'cs2', label: 'Counter Strike 2' },
            { id: 'gta', label: 'Grand Theft Auto V' },
            { id: 'rdr2', label: 'Red Dead Redemption 2' }
        ]);

        const paymentMethodRows = {
            page1: createButtonRow([
                { id: 'Card', label: 'Debit/Credit Card' },
                { id: 'PayPal', label: 'PayPal' },
                { id: 'CashApp', label: 'CashApp' },
                { id: 'Paysafecard', label: 'Paysafecard' },
                { id: 'Next_Page_Payment', label: 'Next Page' }
            ]),
            page2: createButtonRow([
                { id: 'Venmo', label: 'Venmo' },
                { id: 'Skrill', label: 'Skrill' },
                { id: 'Other', label: 'Other' },
                { id: 'Back_Page_Payment', label: 'Back Page' }
            ])
        };

        const backButtonRow = createButtonRow([{ id: 'Back_Button', label: 'Home Page (Back)' }]);

        const handleProductSelection = async (searchTerm, menuId) => {
            const products = await fetchProducts(searchTerm);
            const options = products.map(product => ({
                label: product.name,
                value: `${product.id}`
            }));

            const productMenu = createSelectMenu(menuId, 'Choose a product...', options);
            await interaction.message.delete();
            return interaction.channel.send({
                content: 'Which product are we selecting today?',
                components: [productMenu, backButtonRow]
            });
        };

        const channelId = interaction.channel.id;
        if (!userSelectionContext.has(channelId)) {
            userSelectionContext.set(channelId, { product: null, variant: null });
        }

        const context = userSelectionContext.get(channelId);

        if (interaction.customId === 'Products_SEL') {
            const selectedProduct = interaction.values[0];
            const product = await WooCommerce.get(`products/${selectedProduct}`).then(res => res.data).catch(console.error);

            if (!product) return interaction.channel.send('Error: Product data not found.');

            context.product = product;

            if (product.variations?.length) {
                const variations = await fetchProductVariations(selectedProduct);
                if (variations.length) {
                    const variantMenu = createSelectMenu('Variant_SEL', 'Select a variant', variations.map(variation => ({
                        label: variation.name,
                        value: `${variation.id}`
                    })));

                    await interaction.message.delete();
                    return interaction.channel.send({
                        content: 'Please select a variant:',
                        components: [variantMenu]
                    });
                }
            } else {
                await interaction.message.delete();
                return interaction.channel.send({
                    content: `You selected: ${product.name}. Proceed to payment.`,
                    components: [paymentMethodRows.page1]
                });
            }
        }

        if (interaction.customId === 'Variant_SEL') {
            const selectedVariantId = interaction.values[0];
            context.variant = await fetchProductVariation(context.product.id, selectedVariantId);

            await interaction.message.delete();
            return interaction.channel.send({
                content: `You selected variant: ${context.variant.name}. Proceed to payment options.`,
                components: [paymentMethodRows.page1]
            });
        }

        if (['Card', 'PayPal', 'CashApp', 'Venmo', 'Skrill', 'Paysafecard', 'Other'].includes(interaction.customId)) {
            const paymentMethod = interaction.customId;

            const Card_Embed = new EmbedBuilder()
            .setColor("#c6db0b")
            .setDescription(`__**Card Payment**__\n\n [Click Here](${context.variant && context.variant.permalink ? context.variant.permalink : context.product.permalink})\n\nProduct: **${context.product.name}${context.variant ? ` - ${context.variant.name}` : ''}**\nProduct Price: **$${context.variant?.price ?? context.product.price}**`)
            .setThumbnail("https://habra.com.my/wp-content/uploads/2016/06/logo-visa-mastercard.png.webp")
            .setTimestamp()
            .setFooter({ text: `Command Executed By: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            const PayPal_Embed = new EmbedBuilder()
            .setColor("#c6db0b")
            .setDescription(`__**PayPal Payment**__`)
            .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png")
            .setTimestamp()
            .setFooter({ text: `Command Executed By: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            const CashApp_Embed = new EmbedBuilder()
            .setColor("#c6db0b")
            .setDescription(`__**Cash App Payment**__`)
            .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Square_Cash_app_logo.svg/1200px-Square_Cash_app_logo.svg.png")
            .setTimestamp()
            .setFooter({ text: `Command Executed By: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            const Venmo_Embed = new EmbedBuilder()
            .setColor("#c6db0b")
            .setDescription(`__**Venmo Payment**__`)
            .setThumbnail("https://upload.wikimedia.org/wikipedia/commons/8/84/Venmo_logo.png")
            .setTimestamp()
            .setFooter({ text: `Command Executed By: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            const Skrill_Embed = new EmbedBuilder()
            .setColor("#c6db0b")
            .setDescription(`__**Skrill Payment**__`)
            .setThumbnail("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6kH1ZEz3nFlx5QJuHMO0xAt0RehT1DklYX-smP-hzKw&s")
            .setTimestamp()
            .setFooter({ text: `Command Executed By: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            const Paysafecard_Embed = new EmbedBuilder()
            .setColor("#c6db0b")
            .setDescription(`__**PaySafe Payments**__`)
            .setThumbnail("https://www.pays.de/wp-content/uploads/2018/11/paysafe-card.png")
            .setTimestamp()
            .setFooter({ text: `Command Executed By: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            const Other_Embed = new EmbedBuilder()
            .setColor("#c6db0b")
            .setDescription(`Product Selected: **${context.product.name}${context.variant ? ` - ${context.variant.name}` : ''}**\nProduct Price: ${context.variant?.price ?? context.product.price}\nPayment Method: Other\n\nPlease wait for staff to assist you on this payment method.`)
            .setTimestamp()
            .setFooter({ text: `Command Executed By: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            await interaction.message.delete();
            if (paymentMethod === "Card"){
                await interaction.channel.send({ embeds: [Card_Embed] });
            } else if (paymentMethod === "PayPal") {
                await interaction.channel.send({ embeds: [PayPal_Embed] });
            } else if (paymentMethod === "CashApp") {
                await interaction.channel.send({ embeds: [CashApp_Embed] });
            } else if (paymentMethod === "Venmo") {
                await interaction.channel.send({ embeds: [Venmo_Embed] });
            } else if (paymentMethod === "Skrill") {
                await interaction.channel.send({ embeds: [Skrill_Embed] });
            } else if (paymentMethod === "Paysafecard") {
                await interaction.channel.send({ embeds: [Paysafecard_Embed] });
            } else if (paymentMethod === "Other") {
                await interaction.channel.send({ embeds: [Other_Embed] });
            }

            userSelectionContext.delete(channelId);
            return;
        }

        switch (interaction.customId) {
            case 'buy_yes':
                await interaction.message.delete();
                return interaction.channel.send({ content: 'Let’s proceed with the purchase.', components: [productSelectionButtons] });

            case 'buy_no':
                await interaction.message.delete();
                return interaction.channel.send('If you change your mind, let us know!');

            case 'cs2':
            case 'gta':
            case 'rdr2':
                return handleProductSelection(interaction.customId, 'Products_SEL');

            case 'Back_Button':
                await interaction.message.delete();
                return interaction.channel.send({ content: 'Let’s proceed with the purchase.', components: [productSelectionButtons] });

            case 'Next_Page_Payment':
                await interaction.message.delete();
                return interaction.channel.send({ content: 'Choose your payment method:', components: [paymentMethodRows.page2] });

            case 'Back_Page_Payment':
                await interaction.message.delete();
                return interaction.channel.send({ content: 'Choose your payment method:', components: [paymentMethodRows.page1] });

            default:
                if (interaction.isCommand()) {
                    const command = client.slashCommands.get(interaction.commandName);
                    if (!command) return;
                    try {
                        await command.execute(interaction);
                    } catch (error) {
                        console.error(`Error executing slash command ${interaction.commandName}:`, error);
                        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
                    }
                }
                break;
        }
    }
};
