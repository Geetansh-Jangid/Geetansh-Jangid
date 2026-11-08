---
title: "The Equations of Diffusion, Written Out in Full"
description: "A slow walk through the mathematics of denoising diffusion, from the forward chain to the score function and the reverse SDE."
date: 2026-11-05
tags: [AI, Machine Learning, Mathematics]
category: Technology
draft: false
featured: false
---

Diffusion models look intimidating for an unusual reason: the ideas are not that hard, but the equations are long. A single line can contain a product over a thousand timesteps, an expectation over a Gaussian, and a gradient of a log-density, all at once.

These are my notes on what those lines actually mean. I have tried to write every important equation out in full, rather than hiding the details behind "after some algebra".

Throughout, let $x_0 \in \mathbb{R}^d$ be a data point, $x_1, \ldots, x_T$ be a sequence of increasingly noisy versions of it, and $\theta$ be the parameters of a neural network.

## The forward process

The forward process is a fixed Markov chain that adds a little Gaussian noise at each step:

$$
q\left(x_t \mid x_{t-1}\right)
= \mathcal{N}\!\left(x_t;\ \sqrt{1-\beta_t}\,x_{t-1},\ \beta_t I_d\right)
= \frac{1}{\left(2\pi\beta_t\right)^{d/2}}
\exp\!\left(
-\frac{1}{2\beta_t}
\left\lVert x_t-\sqrt{1-\beta_t}\,x_{t-1}\right\rVert_2^2
\right),
$$

where $0 < \beta_1 < \cdots < \beta_T < 1$ is a variance schedule chosen by hand. Each step keeps the signal slightly smaller and the noise slightly larger, so the chain drifts from data towards a standard normal distribution.

Because every step is Gaussian and linear, the composition of all the steps is also Gaussian. Define

$$
\alpha_t = 1-\beta_t,
\qquad
\bar\alpha_t = \prod_{s=1}^{t}\alpha_s .
$$

Then the distribution of $x_t$ given the original data has a closed form:

$$
q\left(x_t \mid x_0\right)
= \mathcal{N}\!\left(x_t;\ \sqrt{\bar\alpha_t}\,x_0,\ \left(1-\bar\alpha_t\right)I_d\right)
= \frac{1}{\left(2\pi\left(1-\bar\alpha_t\right)\right)^{d/2}}
\exp\!\left(
-\frac{\left\lVert x_t-\sqrt{\bar\alpha_t}\,x_0\right\rVert_2^2}
{2\left(1-\bar\alpha_t\right)}
\right).
$$

Equivalently, and this is the form used in code, we can sample $x_t$ directly by reparameterisation:

$$
x_t
= \sqrt{\bar\alpha_t}\,x_0
+ \sqrt{1-\bar\alpha_t}\,\varepsilon,
\qquad
\varepsilon \sim \mathcal{N}\left(0, I_d\right).
$$

The product $\bar\alpha_t$ is the only thing we need to remember about the schedule. When $\bar\alpha_T$ is close to zero, $x_T$ is almost pure noise and carries almost no information about $x_0$.

## The reverse direction is the hard part

Generation means running the chain backwards. If we knew the true reverse distribution, we could sample $x_T \sim \mathcal{N}(0,I_d)$ and denoise step by step. Bayes' rule gives an expression for it:

$$
q\left(x_{t-1}\mid x_t\right)
= \frac{q\left(x_t\mid x_{t-1}\right)\,q\left(x_{t-1}\right)}{q\left(x_t\right)}
= \frac{
q\left(x_t\mid x_{t-1}\right)
\displaystyle\int q\left(x_{t-1}\mid x_0\right)q\left(x_0\right)\mathrm{d}x_0
}{
\displaystyle\int q\left(x_t\mid x_0\right)q\left(x_0\right)\mathrm{d}x_0
}.
$$

That is a perfectly correct formula and a completely useless one, because both integrals run over the unknown data distribution. We cannot evaluate it, let alone sample from it.

So we approximate it. Every conditional in the reverse chain is chosen to be Gaussian,

$$
p_\theta\left(x_{t-1}\mid x_t\right)
= \mathcal{N}\!\left(x_{t-1};\ \mu_\theta\left(x_t,t\right),\ \Sigma_\theta\left(x_t,t\right)\right),
$$

and a neural network learns the mean and variance. The question is what objective to train it with.

## The evidence lower bound

We would like to maximise the log-likelihood of the data, $\log p_\theta(x_0)$. That is also intractable, so we maximise a lower bound instead. The bound comes from introducing the forward chain as a variational distribution and applying Jensen's inequality:

$$
\log p_\theta\left(x_0\right)
= \log \mathbb{E}_{q\left(x_{1:T}\mid x_0\right)}
\left[
\frac{p_\theta\left(x_{0:T}\right)}{q\left(x_{1:T}\mid x_0\right)}
\right]
\ge
\mathbb{E}_{q\left(x_{1:T}\mid x_0\right)}
\left[
\log \frac{p_\theta\left(x_{0:T}\right)}{q\left(x_{1:T}\mid x_0\right)}
\right].
$$

Writing the joint distributions out and grouping terms by timestep gives the full expansion:

$$
\begin{aligned}
\mathcal{L}_{\mathrm{ELBO}}\left(\theta\right)
&= \mathbb{E}_{q\left(x_{1:T}\mid x_0\right)}
\left[
\log p_\theta\left(x_{0:T}\right)
-\log q\left(x_{1:T}\mid x_0\right)
\right] \\
&= \mathbb{E}_{q}\left[
\log p\left(x_T\right)
+\sum_{t=1}^{T}\log p_\theta\left(x_{t-1}\mid x_t\right)
-\sum_{t=1}^{T}\log q\left(x_t\mid x_{t-1}\right)
\right] \\
&= \underbrace{
\mathbb{E}_{q}\left[\log p\left(x_T\right)-\log q\left(x_T\mid x_0\right)\right]
}_{\text{prior term}}
-\sum_{t=2}^{T}
\underbrace{
\mathbb{E}_{q}\left[
\log \frac{q\left(x_{t-1}\mid x_t,x_0\right)}
{p_\theta\left(x_{t-1}\mid x_t\right)}
\right]
}_{\text{denoising term}}
+\underbrace{
\mathbb{E}_{q}\left[\log p_\theta\left(x_0\mid x_1\right)\right]
}_{\text{reconstruction term}} .
\end{aligned}
$$

The first term has no learnable parameters: it measures how far the final noisy state is from the prior, and it is small by construction if the schedule is good. The third term is a single denoising step at the end. The interesting part is the sum in the middle.

Each term in that sum is a KL divergence between two Gaussians, because the forward posterior $q(x_{t-1}\mid x_t,x_0)$ is also Gaussian. Deriving it from Bayes' rule gives

$$
q\left(x_{t-1}\mid x_t,x_0\right)
= \mathcal{N}\!\left(x_{t-1};\ \tilde\mu_t\left(x_t,x_0\right),\ \tilde\beta_t I_d\right),
$$

with

$$
\tilde\mu_t\left(x_t,x_0\right)
= \frac{\sqrt{\bar\alpha_{t-1}}\,\beta_t}{1-\bar\alpha_t}\,x_0
+ \frac{\sqrt{\alpha_t}\left(1-\bar\alpha_{t-1}\right)}{1-\bar\alpha_t}\,x_t,
\qquad
\tilde\beta_t
= \frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\,\beta_t .
$$

For reference, the KL divergence between two multivariate Gaussians is

$$
D_{\mathrm{KL}}\!\left(
\mathcal{N}\left(\mu_q,\Sigma_q\right)
\ \Vert\
\mathcal{N}\left(\mu_p,\Sigma_p\right)
\right)
= \frac{1}{2}\left[
\log\frac{\det\Sigma_p}{\det\Sigma_q}
- d
+ \operatorname{tr}\!\left(\Sigma_p^{-1}\Sigma_q\right)
+ \left(\mu_p-\mu_q\right)^{\top}
\Sigma_p^{-1}
\left(\mu_p-\mu_q\right)
\right].
$$

In our case both covariances are multiples of the identity, so the log-determinant and trace terms are constants with respect to $\theta$. Minimising the KL divergence therefore reduces to matching the means:

$$
\min_\theta\ D_{\mathrm{KL}}\!\left(
q\left(x_{t-1}\mid x_t,x_0\right)
\ \Vert\
p_\theta\left(x_{t-1}\mid x_t\right)
\right)
\quad\Longleftrightarrow\quad
\min_\theta\ \left\lVert
\mu_\theta\left(x_t,t\right)
-\tilde\mu_t\left(x_t,x_0\right)
\right\rVert_2^2 .
$$

That is the whole trick. A scary sum of KL divergences collapses into a handful of mean-squared errors.

## Predicting noise instead of means

The mean $\tilde\mu_t$ depends on $x_0$, which we do not have at sampling time. But the reparameterisation lets us trade $x_0$ for the noise $\varepsilon$ that produced $x_t$:

$$
x_0
= \frac{x_t-\sqrt{1-\bar\alpha_t}\,\varepsilon}{\sqrt{\bar\alpha_t}} .
$$

Substituting that into $\tilde\mu_t$ and simplifying gives the mean in terms of $x_t$ and $\varepsilon$:

$$
\mu_\theta\left(x_t,t\right)
= \frac{1}{\sqrt{\alpha_t}}\left(
x_t
- \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,
\varepsilon_\theta\left(x_t,t\right)
\right).
$$

So instead of training a network to output a mean, we train it to output the noise that was added. After dropping the per-timestep weighting — which empirically works better than the exact ELBO — the objective becomes the now-familiar denoising loss:

$$
\mathcal{L}_{\mathrm{simple}}\left(\theta\right)
= \mathbb{E}_{t\sim\mathcal{U}\{1,\ldots,T\}}\,
\mathbb{E}_{x_0\sim q\left(x_0\right)}\,
\mathbb{E}_{\varepsilon\sim\mathcal{N}\left(0,I_d\right)}
\left[
\left\lVert
\varepsilon
- \varepsilon_\theta\!\left(
\sqrt{\bar\alpha_t}\,x_0
+\sqrt{1-\bar\alpha_t}\,\varepsilon,\
t
\right)
\right\rVert_2^2
\right].
$$

In code, that is almost embarrassingly short:

```python
for x0 in loader:
    t = torch.randint(1, T + 1, (x0.shape[0],), device=x0.device)
    eps = torch.randn_like(x0)
    abar = alpha_bar[t].view(-1, 1)
    xt = abar.sqrt() * x0 + (1 - abar).sqrt() * eps
    loss = ((eps - model(xt, t)) ** 2).mean()
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
```

Everything else in a diffusion paper is, in some sense, an elaboration of this loop.

## The score function and the continuous limit

There is a second way to view the same objective, and it generalises more cleanly. The **score** of a distribution is the gradient of its log-density:

$$
s_t\left(x\right)
= \nabla_x \log q_t\left(x\right).
$$

The score points in the direction in which the density grows fastest, which is exactly the direction a sample should move to become more likely. For a Gaussian perturbation of data, the score has a closed form in terms of the noise:

$$
\nabla_x\log q_t\left(x\right)
= \frac{\sqrt{\bar\alpha_t}\,
\mathbb{E}\left[x_0\mid x_t=x\right]-x}
{1-\bar\alpha_t}
= -\frac{\mathbb{E}\left[\varepsilon\mid x_t=x\right]}
{\sqrt{1-\bar\alpha_t}} .
$$

This identity is often called Tweedie's formula. It says that denoising and score estimation are the same task up to a scale factor. Training a network $s_\theta(x,t)$ to match the score gives the denoising score matching objective:

$$
\mathcal{L}_{\mathrm{DSM}}\left(\theta\right)
= \mathbb{E}_{t}\left[
\lambda\left(t\right)
\mathbb{E}_{x_0}
\mathbb{E}_{\varepsilon}
\left[
\left\lVert
s_\theta\!\left(
\sqrt{\bar\alpha_t}\,x_0
+\sqrt{1-\bar\alpha_t}\,\varepsilon,\
t
\right)
+\frac{\varepsilon}{\sqrt{1-\bar\alpha_t}}
\right\rVert_2^2
\right]
\right],
$$

where $\lambda(t)$ is a positive weighting. With $\lambda(t) = 1-\bar\alpha_t$ this is equivalent to $\mathcal{L}_{\mathrm{simple}}$.

The continuous-time limit is where the notation becomes genuinely heavy. Let the number of steps go to infinity and replace the discrete schedule with a continuous function $\beta(t)$. The forward process becomes a stochastic differential equation,

$$
\mathrm{d}x
= -\frac{1}{2}\beta\left(t\right)x\,\mathrm{d}t
+ \sqrt{\beta\left(t\right)}\,\mathrm{d}w,
$$

where $w$ is a standard Wiener process. The density $q_t(x)$ then evolves according to the Fokker–Planck equation:

$$
\frac{\partial}{\partial t}q_t\left(x\right)
= \frac{\beta\left(t\right)}{2}
\left[
\nabla\cdot\left(x\,q_t\left(x\right)\right)
+\Delta q_t\left(x\right)
\right],
$$

with $\Delta$ the Laplacian. Anderson's reverse-time result says that the time-reversed process is again a diffusion, with an extra drift term built from the score:

$$
\mathrm{d}x
= \left[
-\frac{1}{2}\beta\left(t\right)x
-\beta\left(t\right)\nabla_x\log q_t\left(x\right)
\right]\mathrm{d}t
+ \sqrt{\beta\left(t\right)}\,\mathrm{d}\bar w,
$$

where $\bar w$ is a Wiener process running backwards in time. This is the continuous version of the reverse chain, and it makes the role of the score explicit: it is the only unknown quantity in the drift.

There is also a deterministic counterpart. Removing the noise from the reverse SDE leaves the probability flow ODE,

$$
\frac{\mathrm{d}x}{\mathrm{d}t}
= -\frac{1}{2}\beta\left(t\right)
\left[
x
+\nabla_x\log q_t\left(x\right)
\right],
$$

which transports the same marginal densities $q_t(x)$ without any stochasticity. Sampling with a numerical ODE solver is often faster and more reproducible than simulating the SDE, at the cost of some sample diversity.

## Guidance

Most practical systems do not sample from the unconditional model. They condition on a prompt $c$ and then exaggerate the conditioning. Classifier-free guidance does this by combining a conditional and an unconditional prediction:

$$
\tilde{\varepsilon}_\theta\left(x_t,t,c\right)
= \left(1+w\right)\varepsilon_\theta\left(x_t,t,c\right)
- w\,\varepsilon_\theta\left(x_t,t,\varnothing\right),
\qquad w \ge 0,
$$

where $\varnothing$ denotes the empty condition and $w$ is the guidance scale. In score form the same operation reads

$$
\tilde{\nabla}_x\log q_t\left(x\mid c\right)
= \left(1+w\right)\nabla_x\log q_t\left(x\mid c\right)
- w\,\nabla_x\log q_t\left(x\right),
$$

which makes the geometry clearer: guidance adds a multiple of the difference between the conditional and unconditional score fields. Large $w$ pushes samples towards regions the condition considers likely, while shrinking diversity and eventually producing oversaturated artifacts.

## Sampling

The reverse chain can be sampled with the ancestral rule implied by $p_\theta$, but many implementations use DDIM, which allows larger strides and a deterministic path. One DDIM update is

$$
x_{t-1}
= \sqrt{\bar\alpha_{t-1}}\,
\underbrace{
\frac{x_t-\sqrt{1-\bar\alpha_t}\,
\varepsilon_\theta\left(x_t,t\right)}
{\sqrt{\bar\alpha_t}}
}_{\hat{x}_0}
+ \sqrt{1-\bar\alpha_{t-1}-\sigma_t^2}\,
\varepsilon_\theta\left(x_t,t\right)
+ \sigma_t\,\varepsilon,
$$

where $\varepsilon\sim\mathcal{N}(0,I_d)$ and $\sigma_t$ controls how much randomness is injected. Setting $\sigma_t=0$ gives the deterministic DDIM sampler; setting $\sigma_t$ to the forward posterior standard deviation recovers the ancestral sampler.

## What the equations are really saying

Read quickly, the formulas above look like a pile of Gaussian integrals. Read slowly, they say something simple.

The forward process is a fixed, known corruption. The reverse process is a learned repair. The ELBO turns the impossible problem of matching a whole distribution into a sequence of easy mean-matching problems. Reparameterisation turns those mean-matching problems into noise prediction. Tweedie's formula turns noise prediction into score estimation. The continuous limit replaces the discrete chain with an SDE, and the score becomes the drift. Guidance is just arithmetic on two score fields.

Every long line in a diffusion paper is one of those steps, written without shortcuts. Once the steps are visible, the length stops being intimidating and starts being useful.
