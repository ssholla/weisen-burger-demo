const core = require('@actions/core');
const { XMLParser } = require('fast-xml-parser');
const { glob } = require('glob');
const fs = require('fs');
const path = require('path');

class MetadataValidator {
  constructor(configPath) {
    this.config = this.loadConfig(configPath);
    this.violations = [];
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true,
      removeNSPrefix: true,
      ignoreNameSpace: true
    });
  }

  loadConfig(configPath) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      throw new Error(`Failed to load configuration from ${configPath}: ${error.message}`);
    }
  }

  async scanDirectory(targetDir) {
    const patterns = [
      '**/*.field-meta.xml',
      '**/*.object-meta.xml',
      '**/*.flow-meta.xml',
      '**/*.permissionset-meta.xml',
      '**/*.profile-meta.xml',
      '**/*.cls-meta.xml'
    ];

    const files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { cwd: targetDir });
      files.push(...matches.map(file => path.join(targetDir, file)));
    }

    return this.filterExcludedFiles(files);
  }

  filterExcludedFiles(files) {
    if (!this.config.excludePatterns || this.config.excludePatterns.length === 0) {
      return files;
    }

    return files.filter(file => {
      const normalizedPath = file.replace(/\\/g, '/');
      return !this.config.excludePatterns.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        return regex.test(normalizedPath);
      });
    });
  }

  parseMetadata(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return this.parser.parse(content);
    } catch (error) {
      core.warning(`Failed to parse XML file ${filePath}: ${error.message}`);
      return null;
    }
  }

  validateFile(filePath, metadata) {
    const fileName = path.basename(filePath);
    const fileType = this.getFileType(filePath);
    
    for (const rule of this.config.rules) {
      if (rule.enabled === false) continue;
      
      try {
        this.applyRule(rule, filePath, fileName, fileType, metadata);
      } catch (error) {
        core.warning(`Error applying rule ${rule.name} to ${filePath}: ${error.message}`);
      }
    }
  }

  getFileType(filePath) {
    if (filePath.includes('.field-meta.xml')) return 'CustomField';
    if (filePath.includes('.object-meta.xml')) return 'CustomObject';
    if (filePath.includes('.flow-meta.xml')) return 'Flow';
    if (filePath.includes('.permissionset-meta.xml')) return 'PermissionSet';
    if (filePath.includes('.profile-meta.xml')) return 'Profile';
    if (filePath.includes('.cls-meta.xml')) return 'ApexClassMetadata';
    return 'Unknown';
  }

  applyRule(rule, filePath, fileName, fileType, metadata) {
    switch (rule.type) {
      case 'field-prefix':
        this.validateFieldPrefix(rule, filePath, fileName, fileType, metadata);
        break;
      case 'field-description':
        this.validateFieldDescription(rule, filePath, fileName, fileType, metadata);
        break;
      case 'object-naming':
        this.validateObjectNaming(rule, filePath, fileName, fileType, metadata);
        break;
      case 'object-description':
        this.validateObjectDescription(rule, filePath, fileName, fileType, metadata);
        break;
      case 'flow-naming':
        this.validateFlowNaming(rule, filePath, fileName, fileType, metadata);
        break;
      case 'apex-naming':
        this.validateApexNaming(rule, filePath, fileName, fileType, metadata);
        break;
      case 'custom-rule':
        this.validateCustomRule(rule, filePath, fileName, fileType, metadata);
        break;
    }
  }

  validateFieldPrefix(rule, filePath, fileName, fileType, metadata) {
    if (fileType !== 'CustomField') return;
    
    const fieldName = fileName.replace('.field-meta.xml', '');
    if (fieldName.endsWith('__c') && !fieldName.startsWith(rule.prefix)) {
      this.addViolation(rule, filePath, `Custom field '${fieldName}' must start with prefix '${rule.prefix}'`);
    }
  }

  validateFieldDescription(rule, filePath, fileName, fileType, metadata) {
    if (fileType !== 'CustomField') return;
    
    const fieldName = fileName.replace('.field-meta.xml', '');
    if (!fieldName.endsWith('__c')) return;
    
    const description = metadata?.CustomField?.description || '';
    if (!description || description.length < (rule.minLength || 10)) {
      this.addViolation(rule, filePath, `Custom field '${fieldName}' description should be at least ${rule.minLength || 10} characters`);
    }
  }

  validateObjectNaming(rule, filePath, fileName, fileType, metadata) {
    if (fileType !== 'CustomObject') return;
    
    const objectName = fileName.replace('.object-meta.xml', '');
    if (objectName.endsWith('__c') && !objectName.startsWith(rule.prefix)) {
      this.addViolation(rule, filePath, `Custom object '${objectName}' must start with prefix '${rule.prefix}'`);
    }
  }

  validateObjectDescription(rule, filePath, fileName, fileType, metadata) {
    if (fileType !== 'CustomObject') return;
    
    const objectName = fileName.replace('.object-meta.xml', '');
    if (!objectName.endsWith('__c')) return;
    
    const description = metadata?.CustomObject?.description || '';
    if (!description || description.length < (rule.minLength || 10)) {
      this.addViolation(rule, filePath, `Custom object '${objectName}' description should be at least ${rule.minLength || 10} characters`);
    }
  }

  validateFlowNaming(rule, filePath, fileName, fileType, metadata) {
    if (fileType !== 'Flow') return;
    
    const flowName = fileName.replace('.flow-meta.xml', '');
    
    if (rule.prefix && !flowName.startsWith(rule.prefix)) {
      this.addViolation(rule, filePath, `Flow '${flowName}' must start with prefix '${rule.prefix}'`);
      return;
    }
  }

  validateApexNaming(rule, filePath, fileName, fileType, metadata) {
    if (fileType !== 'ApexClassMetadata') return;
    
    const className = fileName.replace('.cls-meta.xml', '');
    
    if (!className.startsWith(rule.prefix)) {
      this.addViolation(rule, filePath, `Apex class '${className}' must start with prefix '${rule.prefix}'`);
    }
  }

  validateCustomRule(rule, filePath, fileName, fileType, metadata) {
    try {
      const ruleFunction = new Function('filePath', 'fileName', 'fileType', 'metadata', 'fs', rule.script);
      const result = ruleFunction(filePath, fileName, fileType, metadata, fs);
      
      if (result && result.violation) {
        this.addViolation(rule, filePath, result.message);
      }
    } catch (error) {
      core.warning(`Custom rule '${rule.name}' failed: ${error.message}`);
    }
  }

  addViolation(rule, filePath, message) {
    this.violations.push({
      rule: rule.name,
      severity: rule.severity,
      message: message,
      file: filePath,
      line: 1,
      column: 1,
      category: rule.category || 'General'
    });
  }

  generateSarifOutput() {
    const rules = this.config.rules.map(rule => ({
      id: rule.name,
      name: rule.name,
      shortDescription: { text: rule.description },
      fullDescription: { text: rule.description },
      defaultConfiguration: { level: rule.severity === 'error' ? 'error' : 'warning' },
      properties: {
        category: rule.category || 'General',
        tags: ['metadata', 'salesforce']
      }
    }));

    const results = this.violations.map(violation => ({
      ruleId: violation.rule,
      level: violation.severity === 'error' ? 'error' : 'warning',
      message: { text: violation.message },
      locations: [{
        physicalLocation: {
          artifactLocation: { uri: violation.file },
          region: {
            startLine: violation.line,
            startColumn: violation.column
          }
        }
      }]
    }));

    return {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [{
        tool: {
          driver: {
            name: 'custom-metadata-validator',
            version: '1.0.0',
            informationUri: '',
            rules: rules
          }
        },
        results: results
      }]
    };
  }

  getSummary() {
    const errorCount = this.violations.filter(v => v.severity === 'error').length;
    const warningCount = this.violations.filter(v => v.severity === 'warning').length;
    const infoCount = this.violations.filter(v => v.severity === 'info').length;

    return {
      totalViolations: this.violations.length,
      errorCount,
      warningCount,
      infoCount
    };
  }
}

async function run() {
  try {

    const targetDirectory = core.getInput('target-directory') || process.env.INPUT_TARGET_DIRECTORY || 'force-app';
    const configFile = core.getInput('config-file') || process.env.INPUT_CONFIG_FILE || 'validation-config.json';
    const outputFormat = core.getInput('output-format') || process.env.INPUT_OUTPUT_FORMAT || 'sarif';
    const outputFile = core.getInput('output-file') || process.env.INPUT_OUTPUT_FILE || 'metadata-validation-results.sarif';
    const failOnError = (core.getInput('fail-on-error') || process.env.INPUT_FAIL_ON_ERROR || 'true') === 'true';
    const verbose = (core.getInput('verbose') || process.env.INPUT_VERBOSE || 'false') === 'true';

    core.info(`🚀 Starting custom metadata validation...`);
    core.info(`📁 Target directory: ${targetDirectory}`);
    core.info(`⚙️ Config file: ${configFile}`);
    core.info(`📊 Output format: ${outputFormat}`);

    const configPath = path.isAbsolute(configFile) ? configFile : 
                      (configFile.startsWith('./') ? path.join(process.cwd(), configFile) : 
                       path.join(__dirname, configFile));
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    const validator = new MetadataValidator(configPath);
    
    const files = await validator.scanDirectory(targetDirectory);
    core.info(`📁 Found ${files.length} metadata files`);

    if (verbose) {
      files.forEach(file => core.info(`  - ${file}`));
    }

    let processedFiles = 0;
    for (const file of files) {
      if (verbose) {
        core.info(`🔍 Validating: ${file}`);
      }
      
      const metadata = validator.parseMetadata(file);
      if (metadata) {
        validator.validateFile(file, metadata);
        processedFiles++;
      }
    }

    const summary = validator.getSummary();
    
    core.info(`📊 VALIDATION RESULTS`);
    core.info(`📁 Files scanned: ${processedFiles}`);
    core.info(`🚨 Total violations: ${summary.totalViolations}`);
    core.info(`❌ Errors: ${summary.errorCount}`);
    core.info(`⚠️  Warnings: ${summary.warningCount}`);
    core.info(`ℹ️  Info: ${summary.infoCount}`);

    const absoluteOutputPath = path.resolve(outputFile);
    core.setOutput('violations-count', summary.totalViolations.toString());
    core.setOutput('error-count', summary.errorCount.toString());
    core.setOutput('warning-count', summary.warningCount.toString());
    core.setOutput('results-file', outputFile);
    core.setOutput('results-file-absolute', absoluteOutputPath);

    if (outputFormat === 'sarif') {
      const sarifOutput = validator.generateSarifOutput();
      fs.writeFileSync(outputFile, JSON.stringify(sarifOutput, null, 2));
      core.info(`📄 SARIF results saved to: ${outputFile}`);
    } else if (outputFormat === 'json') {
      const jsonOutput = {
        summary: summary,
        violations: validator.violations
      };
      fs.writeFileSync(outputFile, JSON.stringify(jsonOutput, null, 2));
      core.info(`📄 JSON results saved to: ${outputFile}`);
    }

    if (verbose && validator.violations.length > 0) {
      core.info(`🚨 VIOLATIONS FOUND:`);
      validator.violations.forEach(violation => {
        const icon = violation.severity === 'error' ? '❌' : violation.severity === 'warning' ? '⚠️' : 'ℹ️';
        core.info(`${icon} ${violation.file}: ${violation.message} (${violation.rule})`);
      });
    }

    if (failOnError && summary.errorCount > 0) {
      core.setFailed(`❌ Validation failed with ${summary.errorCount} error(s)`);
    } else {
      core.info(`✅ Metadata validation completed successfully`);
    }

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run, MetadataValidator };
