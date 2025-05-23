const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const {
  SERVICE_NAME,
  MIN_REPLICAS = 1,
  MAX_REPLICAS = 10,
  CPU_UPPER_THRESHOLD = 70,
  CPU_LOWER_THRESHOLD = 30,
  POLL_INTERVAL = 5
} = process.env;

async function getService() {
  const services = await docker.listServices({ filters: { name: [SERVICE_NAME] } });
  if (!services.length) throw new Error(`Serviço ${SERVICE_NAME} não encontrado`);
  return services[0];
}

async function getTaskContainers(service) {
  const tasks = await docker.listTasks({
    filters: {
      service: [ service.Spec.Name ],
      "desired-state": [ 'running' ]
    }
  });
  return tasks
    .map(t => t.Status.ContainerStatus?.ContainerID)
    .filter(id => id);
}

async function getCpuPercent(container) {
  return new Promise((resolve, reject) => {
    container.stats({ stream: false }, (err, stats) => {
      if (err) return reject(err);
      const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuPercent = systemDelta > 0
        ? (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100
        : 0;
      resolve(cpuPercent);
    });
  });
}

async function checkAndScale() {
  try {
    const serviceInfo = await getService();
    const currentReplicas = serviceInfo.Spec.Mode.Replicated.Replicas;
    const containers = await getTaskContainers(serviceInfo);
    if (!containers.length) return;

    // 1) Obter estatísticas de CPU de cada container
    const percents = await Promise.all(containers.map(id => {
      const c = docker.getContainer(id);
      return getCpuPercent(c);
    }));

    // 2) Calcular média
    const sum = percents.reduce((a, b) => a + b, 0);
    const avgCpu = sum / percents.length;
    console.log(`Média CPU: ${avgCpu.toFixed(1)}% (replicas: ${currentReplicas})`);

    // 3) Decidir novo número de réplicas
    let newReplicas = currentReplicas;
    if (avgCpu > Number(CPU_UPPER_THRESHOLD) && currentReplicas < Number(MAX_REPLICAS)) {
      newReplicas++;
    } else if (avgCpu < Number(CPU_LOWER_THRESHOLD) && currentReplicas > Number(MIN_REPLICAS)) {
      newReplicas--;
    }

    // 4) Atualizar serviço se mudar
    if (newReplicas !== currentReplicas) {
      console.log(`→ Ajustando réplicas para ${newReplicas}`);
      const service = docker.getService(serviceInfo.ID);

      // Copiar spec existente e apenas trocar o Replicas
      const newSpec = { ...serviceInfo.Spec };
      newSpec.Mode = { 
        ...newSpec.Mode, 
        Replicated: { Replicas: newReplicas } 
      };

      await service.update({
        version: serviceInfo.Version.Index,
        ...newSpec
      });
    }
  } catch (err) {
    console.error('Erro no autoscaler:', err.message);
  }
}



console.log('Autoscaler iniciado para', SERVICE_NAME);
setInterval(checkAndScale, Number(POLL_INTERVAL) * 1000);
