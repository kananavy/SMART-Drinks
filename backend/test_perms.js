const { Permission, RolePermission } = require('./models');

async function test() {
    try {
        console.log('Testing Permission.findAll...');
        const all = await Permission.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] });
        console.log('Permissions found:', all.length);

        console.log('Testing RolePermission.findAll...');
        const dbPerms = await RolePermission.findAll({ where: { role: 'vendeur' } });
        console.log('RolePermissions found:', dbPerms.length);

        console.log('Success!');
    } catch (err) {
        console.error('ERROR:', err);
    }
    process.exit(0);
}
test();
