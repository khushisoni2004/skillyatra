require('dotenv').config();
const importDsa=require('./importDsaDataset'); const importPractice=require('./importPracticeDataset');
(async()=>{ console.log('SkillYatra dataset import started'); await importDsa(); await importPractice(); console.log('SkillYatra dataset import completed'); process.exit(0); })().catch(e=>{console.error(e);process.exit(1)});
