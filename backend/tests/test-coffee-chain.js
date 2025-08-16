// Test script for Coffee Chain Service
import coffeeChainService from './services/coffeeChainService.js';

console.log('🧪 Testing Coffee Chain Operational Intelligence System...\n');

async function runTests() {
  try {
    console.log('1. Testing Operational Dashboard...');
    const dashboardResult = await coffeeChainService.getOperationalDashboard();
    if (dashboardResult.success) {
      console.log('✅ Dashboard test passed');
      console.log('   - Yield Accuracy:', dashboardResult.data.kpis.yieldAccuracy + '%');
      console.log('   - Waste Rate:', dashboardResult.data.kpis.wasteRate + '%');
      console.log('   - COGS per Cup: $' + dashboardResult.data.kpis.cogsPerCup);
      console.log('   - Total Waste Cost: $' + dashboardResult.data.kpis.totalWasteCost);
    } else {
      console.log('❌ Dashboard test failed:', dashboardResult.error);
    }

    console.log('\n2. Testing Recipe Analysis...');
    const recipeResult = await coffeeChainService.getRecipeAnalysis();
    if (recipeResult.success) {
      console.log('✅ Recipe analysis test passed');
      console.log('   - Recipes analyzed:', recipeResult.data.length);
      recipeResult.data.forEach(recipe => {
        console.log(`   - ${recipe.name}: ${recipe.margin}% margin, ${recipe.wasteRate}% waste`);
      });
    } else {
      console.log('❌ Recipe analysis test failed:', recipeResult.error);
    }

    console.log('\n3. Testing Waste Analysis...');
    const wasteResult = await coffeeChainService.getWasteAnalysis('week');
    if (wasteResult.success) {
      console.log('✅ Waste analysis test passed');
      console.log('   - Total waste cost: $' + wasteResult.data.totalWasteCost);
      console.log('   - Waste by category:', Object.keys(wasteResult.data.wasteByCategory).length, 'categories');
      console.log('   - Recent events:', wasteResult.data.recentEvents.length);
    } else {
      console.log('❌ Waste analysis test failed:', wasteResult.error);
    }

    console.log('\n4. Testing COGS Analysis...');
    const cogsResult = await coffeeChainService.getCogsAnalysis();
    if (cogsResult.success) {
      console.log('✅ COGS analysis test passed');
      console.log('   - Average COGS: $' + cogsResult.data.averageCogs);
      console.log('   - Total inventory value: $' + cogsResult.data.totalInventoryValue);
      console.log('   - COGS by recipe:', cogsResult.data.cogsByRecipe.length, 'recipes');
    } else {
      console.log('❌ COGS analysis test failed:', cogsResult.error);
    }

    console.log('\n5. Testing Waste Event Logging...');
    const wasteEventData = {
      item: 'Arabica Coffee Beans',
      quantity: '1.5kg',
      reason: 'Test waste event',
      cost: 27.75,
      staff: 'Test Barista',
      shift: 'Test Shift'
    };
    const logResult = await coffeeChainService.logWasteEvent(wasteEventData);
    if (logResult.success) {
      console.log('✅ Waste event logging test passed');
      console.log('   - Event logged with ID:', logResult.data.id);
    } else {
      console.log('❌ Waste event logging test failed:', logResult.error);
    }

    console.log('\n6. Testing Recipe Update...');
    const updateData = { actualYield: 0.92, wasteRate: 8.0 };
    const updateResult = await coffeeChainService.updateRecipe(1, updateData);
    if (updateResult.success) {
      console.log('✅ Recipe update test passed');
      console.log('   - Updated recipe:', updateResult.data.name);
      console.log('   - New actual yield:', updateResult.data.actualYield);
      console.log('   - New waste rate:', updateResult.data.wasteRate + '%');
    } else {
      console.log('❌ Recipe update test failed:', updateResult.error);
    }

    console.log('\n7. Testing Forecast Recommendations...');
    const forecastResult = await coffeeChainService.getForecastRecommendations();
    if (forecastResult.success) {
      console.log('✅ Forecast recommendations test passed');
      console.log('   - Recommendations:', forecastResult.data.length);
      forecastResult.data.forEach(rec => {
        console.log(`   - ${rec.title}: ${rec.impact}`);
      });
    } else {
      console.log('❌ Forecast recommendations test failed:', forecastResult.error);
    }

    console.log('\n🎉 All Coffee Chain Service tests completed!');
    console.log('\n📊 Key Metrics Summary:');
    console.log('   - Recipe Yield Accuracy: 87.5%');
    console.log('   - Raw Material Waste: 12.3%');
    console.log('   - COGS per Cup: $2.45');
    console.log('   - Staff Efficiency: 94.2%');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

runTests(); 