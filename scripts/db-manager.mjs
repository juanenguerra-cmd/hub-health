#!/usr/bin/env node
import { spawn } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`\n> ${command} ${args.join(' ')}\n`);
    const child = spawn(command, args, { 
      stdio: 'inherit',
      shell: true 
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function showMenu() {
  console.clear();
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   🏥 Hub Health - Database Manager        ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log('Choose an operation:\n');
  console.log('  1. 📦 Setup new D1 database');
  console.log('  2. 📝 Apply local migrations');
  console.log('  3. ☁️  Apply remote migrations');
  console.log('  4. 🔍 Verify remote database');
  console.log('  5. 🏥 Run health check');
  console.log('  6. 🚀 Full setup (create + migrate + verify)');
  console.log('  7. 💻 Development workflow (local + health)');
  console.log('  8. 📊 Database status');
  console.log('  9. ❌ Exit\n');
}

async function getDatabaseStatus() {
  console.log('\n📊 Checking database status...\n');
  
  try {
    // Check local database
    console.log('Local Database:');
    await runCommand('wrangler', ['d1', 'list']);
    
    // Check migrations
    console.log('\n📝 Migration Status:');
    const migrationsDir = './migrations';
    const fs = await import('fs');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir);
      const sqlFiles = files.filter(f => f.endsWith('.sql'));
      console.log(`Found ${sqlFiles.length} migration file(s):`);
      sqlFiles.forEach(f => console.log(`  - ${f}`));
    } else {
      console.log('⚠️  No migrations directory found');
    }
    
    console.log('\n✅ Status check complete');
  } catch (error) {
    console.error('\n❌ Error checking status:', error.message);
  }
}

async function main() {
  try {
    await showMenu();
    const choice = await ask('Enter choice (1-9): ');
    
    console.log(''); // Add spacing
    
    switch(choice.trim()) {
      case '1':
        console.log('\n📦 Creating D1 database...');
        const dbName = await ask('Enter database name (press Enter for "hub-health"): ');
        const finalDbName = dbName.trim() || 'hub-health';
        await runCommand('wrangler', ['d1', 'create', finalDbName]);
        console.log('\n✅ Database created!');
        console.log('\n⚠️  IMPORTANT: Copy the database_id from above into your wrangler.toml file');
        console.log('\n📝 Example wrangler.toml entry:');
        console.log('[[d1_databases]]');
        console.log('binding = "DB"');
        console.log(`database_name = "${finalDbName}"`);
        console.log('database_id = "<paste-id-here>"');
        break;
        
      case '2':
        console.log('\n📝 Applying local migrations...');
        await runCommand('wrangler', ['d1', 'migrations', 'apply', 'hub-health', '--local']);
        console.log('\n✅ Local migrations applied!');
        break;
        
      case '3':
        console.log('\n☁️  Applying remote migrations...');
        const confirmRemote = await ask('This will modify the production database. Continue? (yes/no): ');
        if (confirmRemote.toLowerCase() === 'yes') {
          await runCommand('npm', ['run', 'd1:migrate:remote']);
          console.log('\n✅ Remote migrations applied!');
        } else {
          console.log('\n❌ Operation cancelled');
        }
        break;
        
      case '4':
        console.log('\n🔍 Verifying remote database...');
        await runCommand('npm', ['run', 'd1:verify:remote']);
        console.log('\n✅ Remote database verified!');
        break;
        
      case '5':
        console.log('\n🏥 Running health check...');
        await runCommand('npm', ['run', 'd1:health']);
        console.log('\n✅ Health check complete!');
        break;
        
      case '6':
        console.log('\n🚀 Running full setup...');
        console.log('\nThis will:');
        console.log('  1. Create a new D1 database');
        console.log('  2. Apply local migrations');
        console.log('  3. Apply remote migrations');
        console.log('  4. Verify the setup');
        
        const confirmFull = await ask('\nContinue? (yes/no): ');
        if (confirmFull.toLowerCase() !== 'yes') {
          console.log('\n❌ Operation cancelled');
          break;
        }
        
        const setupDbName = await ask('Enter database name (press Enter for "hub-health"): ');
        const setupFinalName = setupDbName.trim() || 'hub-health';
        
        console.log('\n📦 Step 1/4: Creating database...');
        await runCommand('wrangler', ['d1', 'create', setupFinalName]);
        
        console.log('\n⏳ Waiting for database to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n📝 Step 2/4: Applying local migrations...');
        await runCommand('wrangler', ['d1', 'migrations', 'apply', setupFinalName, '--local']);
        
        console.log('\n☁️  Step 3/4: Applying remote migrations...');
        await runCommand('npm', ['run', 'd1:migrate:remote']);
        
        console.log('\n🔍 Step 4/4: Verifying setup...');
        await runCommand('npm', ['run', 'd1:verify:remote']);
        
        console.log('\n✅ Full setup complete!');
        console.log('\n⚠️  Don\'t forget to update your wrangler.toml with the database_id!');
        break;
        
      case '7':
        console.log('\n💻 Running development workflow...');
        console.log('\n📝 Step 1/2: Applying local migrations...');
        await runCommand('wrangler', ['d1', 'migrations', 'apply', 'hub-health', '--local']);
        
        console.log('\n🏥 Step 2/2: Running health check...');
        await runCommand('npm', ['run', 'd1:health']);
        
        console.log('\n✅ Development environment ready!');
        console.log('\n💡 You can now run: npm run cf:dev');
        break;
        
      case '8':
        await getDatabaseStatus();
        break;
        
      case '9':
        console.log('\n👋 Goodbye!');
        rl.close();
        return;
        
      default:
        console.log('\n❌ Invalid choice. Please enter a number from 1-9.');
    }
    
    // Ask if user wants to continue
    console.log('');
    const continueChoice = await ask('\nPress Enter to return to menu, or type "exit" to quit: ');
    if (continueChoice.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      rl.close();
    } else {
      await main(); // Show menu again
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Tip: Make sure you have Wrangler installed and configured.');
    console.log('   Run: npm install -g wrangler && wrangler login');
    
    const retry = await ask('\nWould you like to try again? (yes/no): ');
    if (retry.toLowerCase() === 'yes') {
      await main();
    } else {
      rl.close();
      process.exit(1);
    }
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n\n👋 Interrupted. Goodbye!');
  rl.close();
  process.exit(0);
});

main();
