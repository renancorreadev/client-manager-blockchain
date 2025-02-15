import { ethers, upgrades } from 'hardhat';
import { getImplementationAddress } from '@openzeppelin/upgrades-core';
import { JsonRpcProvider } from '@ethersproject/providers';
import { proxyAddress as customerManagementAddress } from '../.deployed/deploys/CustomerManagementCore.json';
import fs from 'fs';
import path from 'path';

const provider = new JsonRpcProvider(process.env.JSON_RPC_URL);

async function main() {
  const contractFactory = await ethers.getContractFactory(
    process.env.CONTRACT_POINTS_CORE_VERSION as string
  );
  const deployContract = await upgrades.deployProxy(
    contractFactory,
    [customerManagementAddress, process.env.METADATA_PROVIDER_URL as string],
    {
      initializer: 'initialize',
    }
  );
  await deployContract.waitForDeployment();

  const proxyContractAddress = await deployContract.getAddress();
  const newImplementationAddress = await getImplementationAddress(
    provider,
    proxyContractAddress
  );

  const data = {
    proxyAddress: proxyContractAddress,
    implementationAddress: newImplementationAddress,
  };

  console.log('Proxy address:', proxyContractAddress);
  console.log('Implementation address:', newImplementationAddress);

  fs.writeFileSync(
    '.deployed/deploys/PointCore.json',
    JSON.stringify(data, null, 2)
  );

  // Função auxiliar para atualizar o arquivo .env
  function updateEnvFile(
    filePath: string,
    variableName: string,
    value: string
  ) {
    const envPath = path.resolve(__dirname, filePath);
    let envFileContent = fs.readFileSync(envPath, 'utf-8');
    const regex = new RegExp(`^${variableName}=.*`, 'm');
    if (envFileContent.match(regex)) {
      envFileContent = envFileContent.replace(
        regex,
        `${variableName}="${value}"`
      );
    } else {
      envFileContent += `\n${variableName}="${value}"`;
    }
    fs.writeFileSync(envPath, envFileContent);
  }

  // Atualizar .env nos dois projetos
  updateEnvFile(
    '../../loyahub-api/.env',
    'POINTS_CONTRACT_ADDRESS',
    proxyContractAddress
  );
  updateEnvFile(
    '../../loyahub-blockchain-service/.env',
    'POINT_CORE_CONTRACT_ADDRESS',
    proxyContractAddress
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
